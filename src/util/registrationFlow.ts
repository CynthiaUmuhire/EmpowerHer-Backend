export default async function registrationFlow(menu, strapi) {

    menu.startState({
        run: () => {
            menu.con('Welcome to EmpowerHer registration portal. \n 1. Start registration');
        },
        next: {
            '1': 'beginRegistration',
            '*': 'invalid_input'
        }
    });

    menu.state('beginRegistration', {
        run: () => {
            console.log('Entering state 1'),
                menu.con('Your username is ' + menu.args.phoneNumber + ' by default. \n 1. Change it. \n 2. Next \n 0. Go back');
        },
        next: {
            '1': '1.1',
            '2': 'firstnameMenu',
            '0': 'start'
        }
    });

    menu.state('1.1', {
        run: () => {
            menu.con('Enter your preferred username:');
            menu.session.set('next_action', 'change_username');
        },
        next: {
            '*': 'handleUserUsernameInput'
        }
    });

    menu.state('handleUserUsernameInput', {
        run: async () => {
            const newUsername = menu.val;
            await menu.session.set('username', newUsername);
            menu.con(`Username set to: ${newUsername}. \n 1. Next \n 0. Go back`);
        },
        next: {
            '1': 'firstnameMenu',
            '0': '1'
        }
    });
    menu.state('firstnameMenu', {
        run: () => {
            menu.con('Enter your first name:');
        },
        next: {
            '*': 'handleUserFirstnameInput'
        }
    });

    menu.state('handleUserFirstnameInput', {
        run: async () => {
            const firstname = menu.val;
            await menu.session.set('firstname', firstname);
            menu.con(`First name set to: ${firstname}. \n Now please enter your last name:`);
        },
        next: {
            '*': 'handleUserLastnameInput',
            '0': 'firstnameMenu'
        }
    });


    menu.state('handleUserLastnameInput', {
        run: async () => {
            const lastname = menu.val;
            await menu.session.set('lastname', lastname);
            menu.con(`Last name saved to ${lastname} \n Enter your email address (or type 0 to skip):`)
        },
        next: {
            '*': 'handleUserEmailInput',
            '0': 'handleUserPasswordInput'
        }
    });

    menu.state('handleUserEmailInput', {
        run: async () => {
            let email = menu.val;
            if (email === '0') email = '';
            await menu.session.set('email', email)
            menu.con(`Email saved to ${email} \n Now, please enter a password for your account: \n 0. Go back`);
        },
        next: {
            '*': 'handleUserPasswordInput',
            '0': 'handleUserLastnameInput'
        }
    });

    menu.state('passwordMenu', {
        run: async () => {
            menu.con('Type a password you wish to use \n 0. Go back')
        },
        next: {
            '*': 'handleUserPasswordInput',
            '0': 'emailMenu'
        }
    });

    menu.state('handleUserPasswordInput', {
        run: async () => {
            const inputPassword = menu.val;
            if (inputPassword.length < 6) {
                menu.con('Password must be at least 6 characters long! \n 1.Try again \n 0. Go Back');

            } else {
                await menu.session.set('password', inputPassword);
                menu.go('roleMenu');
            }
        },
        next: {
            '1': 'selectRole.mother',
            '2': 'selectRole.facilitator',
            '0': '1.2',
            '*': function () {
                if (menu.val.length < 6) {
                    return 'passwordMenu';
                } else {
                    return 'invalid_input';
                }
            }
        }
    });
    menu.state('roleMenu', {
        run: async () => {
            menu.con('Now, select your role: \n 1. Mother \n 2. Facilitator \n 0. Go Back');
        },
        next: {
            '1': 'selectRole.mother',
            '2': 'selectRole.facilitator',
            '0': 'passwordMenu'
        }
    });

    menu.state('selectRole.mother', {
        run: async () => {
            await menu.session.set('role', 'mother');
            menu.con('You selected Mother. \n 1. Confirm Registration \n 0. Go Back to Role Selection');
        },
        next: {
            '1': 'registerUser',
            '0': 'handleUserPasswordInput'
        }
    });

    menu.state('selectRole.facilitator', {
        run: async () => {
            await menu.session.set('role', 'facilitator');
            menu.con('You selected Facilitator. \n 1. Confirm Registration \n 0. Go Back to Role Selection');
        },
        next: {
            '1': 'registerUser',
            '0': 'handleUserPasswordInput'
        }
    });


    menu.state('registerUser', {
        run: async () => {
            const phoneNumber = menu.args.phoneNumber;
            const password = await menu.session.get('password');
            const username = await menu.session.get('username') || phoneNumber;
            const selectedRole = await menu.session.get('role');
            const firstname = await menu.session.get('firstname');
            const lastname = await menu.session.get('lastname') || 'User';
            const email = await menu.session.get('email')

            console.log('Registering user with data:', {
                phoneNumber,
                password,
                username,
                selectedRole
            });
            const language = "kinya";

            if (!password || !selectedRole) {
                menu.end('Registration data incomplete. Please restart. 😔');
                return;
            }

            try {
                const result = await strapi.service('api::ussd.ussd').createUser({
                    phoneNumber,
                    password,
                    email,
                    language,
                    role: selectedRole,
                    username,
                    firstname,
                    lastname
                });

                console.log('Registration result:', result, '-------------');
                if (result.success) {
                    menu.end('Registration successful 🎊 Thank you for joining EmpowerHer!');
                } else {
                    menu.end(`An error occurred during registration: ${result.message || 'Please try again.'}`);
                    await menu.session.set('password', '');
                }
            } catch (error) {
                console.error('Registration error:', error);
                menu.end('An unexpected error occurred. Please try again later.');
                await menu.session.set('password', '');
            }
        }
    });


    menu.state('invalid_input', {
        run: () => {
            menu.end('END Invalid option. Please try again.');
        }
    });

    menu.on('error', (err) => {
        console.error('USSD Menu Error:', err);
        menu.end('END An internal error occurred. Please try again later.');
    });

}