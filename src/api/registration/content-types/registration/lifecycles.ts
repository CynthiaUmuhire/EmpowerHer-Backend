import { notifyJoinRequestStatus } from '../../../../util/smsNotifications';

export default {
    async afterUpdate(event) {
        const { result, params } = event;

        // Only notify if status actually changed to Approved or Declined
        if (
            params.data.registrationStatus &&
            ['Approved', 'Declined'].includes(params.data.registrationStatus)
        ) {
            // Fetch full registration with relations
            const fullRegistration = await strapi.entityService.findOne(
                'api::registration.registration',
                result.id,
                { populate: ['mothers', 'group'] }
            ) as (typeof result & { mothers?: Array<{ phoneNumber?: string }>, group?: { name?: string } });

            // Populate mothers and group if not already
            const mothers = fullRegistration.mothers || [];
            const groupName = fullRegistration.group?.name || 'the group';
            for (const mother of mothers) {
                if (mother.phoneNumber) {
                    await notifyJoinRequestStatus(
                        mother.phoneNumber,
                        groupName,
                        params.data.registrationStatus.toLowerCase()
                    );
                }
            }
        }
    },
}; 