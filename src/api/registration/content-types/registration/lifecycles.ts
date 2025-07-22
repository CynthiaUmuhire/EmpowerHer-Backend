import { notifyJoinRequestStatus } from '../../../../util/smsNotifications';

export default {
    async afterUpdate(event) {
        const { result, params } = event;
        // Only notify if status actually changed to Approved or Declined
        if (
            params.data.registrationStatus &&
            ['Approved', 'Declined'].includes(params.data.registrationStatus)
        ) {
            // Populate mothers and group if not already
            const mothers = (result as any).mothers || [];
            const groupName = (result as any).group?.name || 'the group';
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