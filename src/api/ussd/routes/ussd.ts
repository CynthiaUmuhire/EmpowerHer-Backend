/**
 * ussd router
 */
export default {
    routes: [
        {
            method: 'POST',
            path: '/ussd',
            handler: 'api::ussd.ussd.create',
            config: {
                policies: [],
                middlewares: [],
                auth: false
            },
        },
        {
            method: 'POST',
            path: '/register',
            handler: 'api::ussd.ussd.registerUserFromWeb',
            config: {
                policies: [],
                middlewares: [],
                auth: false
            },
        }
    ]
};
