export default function eventsGroupsFlow(menu, strapi) {
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
        run: () => {
            menu.con('Events list coming soon!\n0. Back');
        },
        next: {
            '0': 'eventsGroups'
        }
    });

    menu.state('eventsGroups.viewGroups', {
        run: () => {
            menu.con('Groups list coming soon!\n0. Back');
        },
        next: {
            '0': 'eventsGroups'
        }
    });
}