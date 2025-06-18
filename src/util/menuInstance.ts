// src/utils/menuInstance.js
import UssdMenu from 'ussd-menu-builder';
import registrationFlow from './registrationFlow';
const menu = new UssdMenu();

(async () => {
    try {
        await registrationFlow(menu, strapi);
    } catch (err) {
        console.error('Failed to initialize USSD menu:', err);
    }
})();

export default menu;
