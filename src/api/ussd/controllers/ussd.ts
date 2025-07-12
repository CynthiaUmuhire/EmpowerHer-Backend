import { Core, factories } from '@strapi/strapi';
import UssdMenu from 'ussd-menu-builder';
import globalFlow from '../../../util/globalFlow';

const menu = new UssdMenu();
menu.sessionConfig({
    start: async (sessionId, callback) => {
        await strapi.service('api::ussd-session.ussd-session').start(sessionId);
        callback(null, {});
    },
    end: async (sessionId, callback) => {
        await strapi.service('api::ussd-session.ussd-session').end(sessionId);
        callback(null);
    },
    get: async (sessionId, key, callback) => {
        const value = await strapi.service('api::ussd-session.ussd-session').get(sessionId, key);
        if (callback) callback(null, value);
        return value;
    },
    set: async (sessionId, key, value, callback) => {
        await strapi.service('api::ussd-session.ussd-session').set(sessionId, key, value);
        if (callback) callback(null);
    }
});
globalFlow(menu, strapi);


export default factories.createCoreController('api::ussd.ussd', function ({ strapi }: { strapi: Core.Strapi }) {
    return {
        async create(ctx) {
            try {
                const { phoneNumber, text, sessionId, serviceCode } = ctx.request.body;
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
                console.log('Processing USSD request with args:', args);
                const ussdResponse = await menu.run(args);
                console.log('USSD response:', ussdResponse);
                if (!ussdResponse) {
                    ctx.body = 'END An error occurred while processing your request. Please try again later.';
                    return;
                }

                ctx.body = ussdResponse;

            } catch (error) {
                console.error('Error processing USSD request in controller:', error);
                return ctx.badRequest('END An error occurred. Please try again later.');
            }

        },
        async registerUserFromWeb(ctx) {
            try {
                const { phoneNumber, password, username, role, email, firstname, lastname } = ctx.request.body.data;
                if (!phoneNumber) {
                    return ctx.badRequest(' Phone number is required. Please provide your phone number.');
                }
                if (!password) {
                    return ctx.badRequest(' Password is required. Please provide a password.');
                }
                if (!role) {
                    return ctx.badRequest(' Role is required. Please select a role.');
                }
                if (!email) {
                    return ctx.badRequest(' Email is required. Please provide your email address.');
                }
                if (!firstname) {
                    return ctx.badRequest(' First name is required. Please provide your first name.');
                }
                if (!lastname) {
                    return ctx.badRequest(' Last name is required. Please provide your last name.');
                }

                const language = "kinya";

                const result = await strapi.service('api::ussd.ussd').createUser({
                    phoneNumber,
                    password,
                    email,
                    language,
                    role,
                    username: username || phoneNumber,
                    firstname,
                    lastname
                })
                return super.transformResponse(result);
            } catch (error) {
                throw error;
            }
        }
    }
});