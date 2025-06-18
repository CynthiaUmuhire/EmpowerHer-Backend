import bcrypt from 'bcryptjs';

export default {
    createUser: async ({ phoneNumber, password, email, language, role }) => {
        try {
            const defaultRole = await strapi.query("plugin::users-permissions.role").findOne({
                where: { type: "authenticated" },
            });

            const hashedPassword = await bcrypt.hash(password, 10);

            const newUser = await strapi.db.query("plugin::users-permissions.user").create({
                data: {
                    username: phoneNumber,
                    password: hashedPassword,
                    email: email,
                    confirmed: false,
                    blocked: false,
                    role: role || defaultRole.id,
                    provider: "local",
                    language: language
                }
            });

            return { success: true, user: newUser };
        } catch (error) {
            return { success: false, error };
        }
    }
};