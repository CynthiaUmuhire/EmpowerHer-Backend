import bcrypt from 'bcryptjs';

export default {
    createUser: async ({ username, phoneNumber, password, email, language, role }) => {
        try {
            const roleId = await strapi.query("plugin::users-permissions.role").findOne({
                where: { type: role },
            });

            const hashedPassword = await bcrypt.hash(password, 10);
            const existingUser = await strapi.db.query("plugin::users-permissions.user").findOne({
                where: { phoneNumber: phoneNumber },
            });

            if (existingUser) {
                throw new Error("User with this phone number already exists.");
            }

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
        } catch (error) {
            throw error;
        }
    }
};