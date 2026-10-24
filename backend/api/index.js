
const accountTypeDefs = require("./typeDefs/account");
const userTypeDefs = require("./typeDefs/user.tyeDefs.js");
const userResolvers = require("./resolvers/user.resolver");
const accountResolvers = require("./resolvers/account.resolver");
const {mergeTypeDefs,mergeResolvers} = require("@graphql-tools/merge");
const mergedTypeDefs = mergeTypeDefs([
    accountTypeDefs,
    userTypeDefs,
])

const mergedResolvers = mergeResolvers([
    accountResolvers,
    userResolvers,
]);

module.exports = {
    mergedTypeDefs,
    mergedResolvers,
};
