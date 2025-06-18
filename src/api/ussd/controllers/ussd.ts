// /**
//  * ussd controller
//  */

// import { factories } from "@strapi/strapi";
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::ussd.ussd', function () {
    let password = ''

    return {
        async create(ctx) {
            const { phoneNumber, text, email } = ctx.request.body;

            const initialMenu = `CON Welcome EmpowerHer registration portal. \n 1.Start registration `
            const registrationMenu = `CON Type a password you wish to use \n 0. Go back`
            const usernameMenu = `CON Your username is ${phoneNumber} by default. \n 1.Change it. \n 2. Next \n 0. Go back`

            let response = ''

            //TODO: give users an option to input their preferred language
            let language = "kinya"
            let role: 'facilitator' | 'mother' = 'mother';
            let username = phoneNumber;


            if (`1*${password}*1` === text) {
                const language = "kinya";
                const result = await strapi.service('api::ussd.ussd').createUser({
                    phoneNumber,
                    password,
                    email,
                    language,
                    role
                });

                if (result.success) {
                    return `CON Registration successful 🎊`;
                } else {
                    password = '';
                    return `CON An error occured! \n 0. try password again`;
                }
            }

            if (text === `1*${password}*1*0`) {
                console.log('text with wrong password', text)
                password = ''
                response = registrationMenu
                return response
            }

            if (text.startsWith('1s*')) {
                console.log('text', text)
                password = text.split('*')[1]
                console.log('password', password)
                if (password.length < 6) {
                    response = `CON Password must be at least 6 characters long! Try again`
                    password = ''
                    return response
                }
                response = `CON Your \n username is  ${phoneNumber} \n password is ${password} \n 1. Register \n 0. Go back`
                return response
            }
            switch (text) {
                case null:
                    response = initialMenu
                    break;
                case undefined:
                    response = initialMenu
                    break;
                case "":
                    response = initialMenu
                    break;
                // Registration
                case '1':
                    response = usernameMenu
                    break;
                case '1*':
                    response = usernameMenu
                default:
                    console.log('text', text, text.startsWith('2*'))
                    response = `END Invalid option= ${text}`
                    break;
            }
            return response
        }
    }
});

