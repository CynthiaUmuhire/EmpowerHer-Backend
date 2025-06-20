import bcrypt from 'bcryptjs';

export default {
    createUser: async ({ username, phoneNumber, password, email, language, role }) => {
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingUser = await strapi.db.query("plugin::users-permissions.user").findOne({
            where: { phoneNumber: phoneNumber },
        });

        if (existingUser) {
            throw new Error("User with this phone number already exists.");
        }

        let roleId;
        try {
            if (role === 'facilitator') {
                roleId = await strapi.db.query('admin::role').findOne({
                    where: { code: 'strapi-author' },
                });
                const admin = await strapi.admin.services.user.create({
                    firstname: username,
                    lastname: 'Facilitator',
                    email,
                    password,
                    username,
                    isActive: true,
                    roles: [roleId.id]
                })

                return { success: true, user: admin };
            } else {
                roleId = await strapi.query("plugin::users-permissions.role").findOne({
                    where: { type: role },
                });

                const newUser = await strapi.db.query("plugin::users-permissions.user").create({
                    data: {
                        username: username,
                        password: hashedPassword,
                        email: email,
                        confirmed: false,
                        blocked: false,
                        role: roleId,
                        provider: "local",
                        language: language,
                        phoneNumber: phoneNumber,
                    }
                });

                return { success: true, user: newUser };
            }
        } catch (error) {
            throw error;
        }
    }
};