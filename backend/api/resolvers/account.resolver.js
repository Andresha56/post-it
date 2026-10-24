const accountResolvers = {
    Query: {
        getAccount: async (_, { input }, {sub} ) => {

            return await sub;
        },
    },
    Mutation: {
        connectAccount: async (_, { input }, { sub }) => {
            if(!sub) {
                throw new Error("Unauthorized request");
            }
            // Implement the logic to connect the account here
        }
        // Define your mutations here if needed
    },
};

module.exports = accountResolvers;