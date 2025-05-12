// /**
//  * ussd controller
//  */

// import { factories } from "@strapi/strapi";
import bcrypt from 'bcryptjs'
import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::ussd.ussd', function () {
    let password = ''

    return {
        async create(ctx) {
            const { phoneNumber, text, email } = ctx.request.body;

            const initialMenu = `CON Welcome EmpowerHer registration portal. \n 1. Register here \n 2.My credentials `

            const registrationMenu = `CON Type a password you wish to use \n 0. Go back`

            let response = ''

            if (`1*${password}*1` === text) {

                try {
                    const defaultRole = await strapi.query("plugin::users-permissions.role").findOne({
                        where: { type: "authenticated" },
                    });

                    const hashedPassword = await bcrypt.hash(password, 10);
                    console.log('password ====', password)

                    const newuser = await strapi.documents("plugin::users-permissions.user").create({
                        data: {
                            username: phoneNumber,
                            password: hashedPassword,
                            email: email,
                            confirmed: false,
                            blocked: false,
                            role: defaultRole.id,
                            provider: "local",
                        }
                    });

                    console.log('user', newuser)
                    response = `CON Registration successful 🎊`

                    return response
                } catch (error) {
                    console.log('error', error)
                    response = `CON An error occured! \n 0. try password again`
                    password = ''
                    return response
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
                    response = registrationMenu
                    break;

                // registration ends
                case '1*0':
                    response = initialMenu
                    break;
                case '2':
                    response = `CON Your number is${phoneNumber} \n 0. Go back`
                    break;
                case '2*0':
                    response = initialMenu
                    break;
                default:
                    console.log('text', text, text.startsWith('2*'))
                    response = `END Invalid option= ${text}`
                    break;
            }
            return response
        }
    }
});

