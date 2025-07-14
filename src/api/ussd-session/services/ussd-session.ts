import { factories } from '@strapi/strapi';

export default factories.createCoreService('api::ussd-session.ussd-session', ({ strapi }) => ({
    /**
     * Starts a new session or ensures an existing one is ready without resetting data.
     * @param {string} sessionId - The unique session identifier.
     * @returns {Promise<object>} - An empty object on success.
     */
    async start(sessionId) {
        try {
            const existingSession = await strapi.db.query('api::ussd-session.ussd-session').findOne({
                where: { sessionId },
            });

            if (!existingSession) {
                // Create a new session with an empty data object
                await strapi.db.query('api::ussd-session.ussd-session').create({
                    data: { sessionId, data: {} },
                });
                console.log(`Created new session for sessionId: ${sessionId}`);
            } else {
                // Log existing session data for debugging
                console.log(`Existing session found for sessionId: ${sessionId}, data: ${JSON.stringify(existingSession.data)}`);
            }

            return {};
        } catch (error) {
            console.error(`Error starting session ${sessionId}:`, error);
            throw new Error('Failed to start session');
        }
    },

    /**
     * Ends a session by deleting it from the database.
     * @param {string} sessionId - The unique session identifier.
     * @returns {Promise<void>}
     */
    async end(sessionId) {
        try {
            await strapi.db.query('api::ussd-session.ussd-session').delete({
                where: { sessionId },
            });
        } catch (error) {
            console.error(`Error ending session ${sessionId}:`, error);
            throw new Error('Failed to end session');
        }
    },

    /**
     * Retrieves a value for a given key from the session data.
     * @param {string} sessionId - The unique session identifier.
     * @param {string} key - The key to retrieve.
     * @returns {Promise<any>} - The value associated with the key, or undefined if not found.
     */
    async get(sessionId, key) {
        try {
            const session = await strapi.db.query('api::ussd-session.ussd-session').findOne({
                where: { sessionId },
            });

            if (!session || !session.data) {
                console.log(`Session not found or empty data for sessionId: ${sessionId}, key: ${key}`);
                return undefined;
            }

            const value = session.data[key];
            return value;
        } catch (error) {
            console.error(`Error getting key ${key} for session ${sessionId}:`, error);
            throw new Error('Failed to retrieve session data');
        }
    },

    /**
     * Sets a key-value pair in the session data, merging with existing data.
     * @param {string} sessionId - The unique session identifier.
     * @param {string} key - The key to set.
     * @param {any} value - The value to set.
     * @returns {Promise<void>}
     */
    async set(sessionId, key, value) {
        try {
            const session = await strapi.db.query('api::ussd-session.ussd-session').findOne({
                where: { sessionId },
            });

            if (!session) {
                // Create a new session with the key-value pair
                await strapi.db.query('api::ussd-session.ussd-session').create({
                    data: { sessionId, data: { [key]: value } },
                });
                return;
            }

            // Merge new key-value pair with existing data
            const updatedData = { ...session.data, [key]: value };

            // Update the session with the merged data
            const updatedSession = await strapi.db.query('api::ussd-session.ussd-session').update({
                where: { sessionId },
                data: { data: updatedData },
            });
        } catch (error) {
            console.error(`Error setting ${key}=${value} for session ${sessionId}:`, error);
            throw new Error('Failed to set session data');
        }
    },
}));