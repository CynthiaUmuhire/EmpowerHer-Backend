import { notifyEventUpdate } from '../../../../util/smsNotifications';

export default {
    async afterCreate(event) {
        const { result } = event;
        // Fetch full RSVP with relations
        const fullRSVP = await strapi.entityService.findOne(
            'api::rsvp.rsvp',
            result.id,
            { populate: ['event', 'user'] }
        ) as {
            id: number;
            documentId: string;
            locale?: string;
            createdAt?: string;
            publishedAt?: string;
            rsvpValue?: "Maybe" | "Reserve" | "Decline";
            updatedAt?: string;
            event?: { title?: string };
            user?: { phoneNumber?: string };
        };
        const eventName = fullRSVP.event?.title || 'the event';
        const updateDetails = 'Your RSVP has been received.';
        const userPhones = [];
        if (fullRSVP.user && fullRSVP.user.phoneNumber) {
            userPhones.push(fullRSVP.user.phoneNumber);
        }
        if (userPhones.length > 0) {
            await notifyEventUpdate(userPhones, eventName, updateDetails);
        }
    },
};
