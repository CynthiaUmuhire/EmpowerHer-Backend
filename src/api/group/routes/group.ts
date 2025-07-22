/**
 * group router
 */

import { factories } from '@strapi/strapi';

export default [
    {
        method: 'POST',
        path: '/groups/announce',
        handler: 'group.announce',
        config: {
            policies: [],
            middlewares: [],
        },
    },
    {
        method: 'POST',
        path: '/groups/handle-join-request',
        handler: 'group.handleJoinRequest',
        config: {
            policies: [],
            middlewares: [],
        },
    },
];
