import UssdMenu from "ussd-menu-builder";
import { Core } from "@strapi/strapi";

export default function globalFlow(menu: UssdMenu, strapi: Core.Strapi) {

    menu.startState({
        run: () => {
            menu.con('Welcome to EmpowerHer portal.\n1. Register\n2. Events & Groups');
        },
        next: {
            '1': 'register',
            '2': 'eventsGroups',
            '*': 'invalid_input'
        }
    });

    menu.state('register', {
        run: () => {
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

    menu.state('eventsGroups', {
        run: () => {
            menu.con('Welcome to Events & Groups!\n1. View Events\n2. View Groups\n0. Main Menu');
        },
        next: {
            '1': 'eventsGroups.viewEvents',
            '2': 'eventsGroups.viewGroups',
            '0': 'start'
        }
    });


    menu.state('eventsGroups.viewEvents', {
        run: async () => {
            let page = await menu.session.get('eventsPage') || 0;
            try {
                const events = await strapi.service('api::event.event').find({ pagination: { page: page, pageSize: 5 }, populate: ['group'] });
                menu.session.set('eventsPage', events.pagination.page);
                if (events && events.results && events.results.length > 0) {
                    let msg = 'Events:\n';
                    events.results.forEach((event, idx) => {
                        msg += `${idx + 1}. ${event.title}\n`;
                    });
                    msg += 'n. Next\n0. Previous';
                    menu.con(msg);
                } else {
                    menu.con('No events found.\n0. Previous');
                }
            } catch (err) {
                console.error('Error fetching events:', err);
                menu.con('Error fetching events.\n0. Previous');
            }
        },
        next: {
            '0': async () => { let page = await menu.session.get('eventsPage') || 0; await menu.session.set('eventsPage', page - 1 || 0); return 'eventsGroups.viewEvents'; },
            'n': async () => { let page = await menu.session.get('eventsPage') || 0; await menu.session.set('eventsPage', page + 1); return 'eventsGroups.viewEvents'; },
            '*': 'eventsGroups.eventDetails'
        }
    });

    menu.state('eventsGroups.eventDetails', {
        run: async () => {
            const selection = parseInt(menu.val, 10);
            const events = await menu.session.get('lastEvents') || [];
            if (!isNaN(selection) && events[selection - 1]) {
                const event = events[selection - 1];
                let contact = '';
                if (event.group && event.group.assistantContact) {
                    contact = event.group.assistantContact;
                } else if (event.plannerContact) {
                    contact = event.plannerContact;
                } else {
                    contact = 'Sorry could not find the contacts now. Try again later';
                }
                menu.con(`Event: ${event.title}\nContact: ${contact}\n0. Back`);
            } else {
                menu.con('Invalid selection.\n0. Back');
            }
        },
        next: {
            '0': 'eventsGroups.viewEvents',
            '*': 'eventsGroups.eventDetails'
        }
    });

    menu.state('eventsGroups.viewGroups', {
        run: async () => {
            let page = await menu.session.get('groupsPage');
            try {
                const groups = await strapi.service('api::group.group').find({ pagination: { page: page, pageSize: 5 } });
                menu.session.set('groupsPage', groups.pagination.page);
                if (groups && groups.results && groups.results.length > 0) {
                    let msg = 'Groups:\n';
                    groups.results.forEach((group, idx) => {
                        msg += `${idx + 1}. ${group.name}\n`;
                    });
                    msg += 'n. Next\n0. Back';
                    menu.con(msg);
                } else {
                    menu.con('No groups found.\n0. Back');
                }
            } catch (err) {
                menu.con('Error fetching groups.\n0. Back');
            }
        },
        next: {
            '0': async () => { let page = await menu.session.get('groupsPage'); await menu.session.set('groupsPage', page - 1); return 'eventsGroups.viewGroups'; },
            'n': async () => { let page = await menu.session.get('groupsPage'); await menu.session.set('groupsPage', page + 1); return 'eventsGroups.viewGroups'; },
            '': 'eventsGroups.groupDetails'
        }
    });

    menu.state('eventsGroups.groupDetails', {
        run: async () => {
            const selection = parseInt(menu.val, 10);
            const groups = await menu.session.get('lastGroups') || [];
            if (!isNaN(selection) && groups[selection - 1]) {
                const group = groups[selection - 1];
                let contact = '';
                if (group.assistantContact) {
                    contact = group.assistantContact;
                } else {
                    contact = 'N/A';
                }
                menu.con(`Group: ${group.name}\nContact: ${contact}\n0. Back`);
            } else {
                menu.con('Invalid selection.\n0. Back');
            }
        },
        next: {
            '0': 'eventsGroups.viewGroups',
            '*': 'eventsGroups.groupDetails'
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
