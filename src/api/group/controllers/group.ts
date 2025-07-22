/**
 * group controller
 */

import { factories } from '@strapi/strapi'
import { sendGroupAnnouncement } from '../../../util/smsNotifications';
import { notifyJoinRequestStatus } from '../../../util/smsNotifications';

const customGroupController = {
    async announce(ctx) {
        const { groupId, announcement } = ctx.request.body;
        if (!groupId || !announcement) {
            ctx.throw(400, 'groupId and announcement are required');
        }

        // Fetch group with approved members
        const group = await strapi.entityService.findOne('api::group.group', groupId, {
            populate: ['approvedMembers'],
        });
        if (!group) {
            ctx.throw(404, 'Group not found');
        }

        // Get phone numbers of approved members
        const memberPhones = ((group as any).approvedMembers || [])
            .map((member: any) => member.phoneNumber)
            .filter(Boolean);

        // Send SMS announcement
        await sendGroupAnnouncement(memberPhones, group.name, announcement);

        ctx.send({ success: true, message: 'Announcement sent to group members.' });
    },
    async handleJoinRequest(ctx) {
        const { registrationId, status } = ctx.request.body;
        if (!registrationId || !['Approved', 'Declined'].includes(status)) {
            ctx.throw(400, 'registrationId and valid status (Approved or Declined) are required');
        }

        // Update the registration status
        const updatedRegistration = await strapi.entityService.update('api::registration.registration', registrationId, {
            data: { registrationStatus: status },
            populate: ['mothers', 'group'],
        });
        if (!updatedRegistration) {
            ctx.throw(404, 'Registration not found');
        }

        // Notify all users in the mothers relation (could be one or more)
        const groupName = (updatedRegistration as any).group?.name || 'the group';
        const mothers = (updatedRegistration as any).mothers || [];
        for (const mother of mothers) {
            if (mother.phoneNumber) {
                await notifyJoinRequestStatus(mother.phoneNumber, groupName, status.toLowerCase());
            }
        }

        ctx.send({ success: true, message: `User(s) notified of ${status.toLowerCase()} status.` });
    },
};

export default factories.createCoreController('api::group.group', customGroupController);
