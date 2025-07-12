// src/util/ussdMainFlow.ts

export default function ussdMainFlow(menu, strapi) {
    // Main menu
    menu.startState({
        run: () => {
            return 'CON Welcome to EmpowerHer portal.\n1. Register\n2. Events & Groups';
        },
        next: {
            '1': 'register',
            '2': 'eventsGroups',
            '*': 'invalid_input'
        }
    });

    // Registration flow states
    menu.state('register', {
        run: () => {
            menu.con('Registration step 1...\n1. Next\n0. Main Menu');
        },
        next: {
            '1': 'register.step2',
            '0': 'start'
        }
    });
    menu.state('register.step2', {
        run: () => {
            menu.con('Registration step 2...\n0. Main Menu');
        },
        next: {
            '0': 'start'
        }
    });

    // Events/Groups flow states
    menu.state('eventsGroups', {
        run: () => {
            menu.con('Events & Groups step 1...\n1. Next\n0. Main Menu');
        },
        next: {
            '1': 'eventsGroups.step2',
            '0': 'start'
        }
    });
    menu.state('eventsGroups.step2', {
        run: () => {
            menu.con('Events & Groups step 2...\n0. Main Menu');
        },
        next: {
            '0': 'start'
        }
    });

    // Invalid input state
    menu.state('invalid_input', {
        run: () => {
            menu.con('Invalid input. Please try again.\n1. Register\n2. Events & Groups');
        },
        next: {
            '1': 'register',
            '2': 'eventsGroups',
            '*': 'start'
        }
    });
} 