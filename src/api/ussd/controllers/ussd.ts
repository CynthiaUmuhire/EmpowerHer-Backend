import { Core, factories } from '@strapi/strapi';
import menu from '../../../util/menuInstance';


export default factories.createCoreController('api::ussd.ussd', function ({ strapi }: { strapi: Core.Strapi }) {
    return {
        async create(ctx) {
            try {
                const { phoneNumber, text, sessionId, serviceCode } = ctx.request.body;
                console.log('Startinggggggg')
                if (!sessionId) {
                    ctx.body = 'END Session error. Please try again.';
                    return;
                }

                const args = {
                    phoneNumber: phoneNumber,
                    sessionId,
                    text: text || '',
                    serviceCode: serviceCode || ''
                };
                const ussdResponse = await menu.run(args);

                ctx.body = ussdResponse;

            } catch (error) {
                console.error('Error processing USSD request in controller:', error);
                return ctx.badRequest('END An error occurred. Please try again later.');
            }

        }
    }
});