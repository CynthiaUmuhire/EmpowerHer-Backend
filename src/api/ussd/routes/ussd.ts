/**
 * ussd router
 */

import { factories } from '@strapi/strapi';

export default factories.createCoreRouter('api::ussd.ussd', {
prefix: '',
only: ['create'],
config : {
    create: {
        auth: false
    }
}
});
