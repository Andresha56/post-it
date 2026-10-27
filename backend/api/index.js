
const accountTypeDefs = require("./typeDefs/account.typeDefs.js");
const userTypeDefs = require("./typeDefs/user.tyeDefs.js");
const userResolvers = require("./resolvers/user.resolver");
const accountResolvers = require("./resolvers/account.resolver");
const contentResolver = require("./resolvers/content.resolver.js");
const { mergeTypeDefs, mergeResolvers } = require("@graphql-tools/merge");
const contentTypeDefs = require("./typeDefs/content.typeDefs.js");
const uploadResolver = require("./resolvers/uploasResolver.js");
const uploadTypeDefs = require("./typeDefs/upload.typeDefs.js")
const mergedTypeDefs = mergeTypeDefs([
    accountTypeDefs,
    userTypeDefs,
    contentTypeDefs,
    uploadTypeDefs
])

const mergedResolvers = mergeResolvers([
    accountResolvers,
    userResolvers,
    contentResolver,
    uploadResolver,
]);

module.exports = {
    mergedTypeDefs,
    mergedResolvers,
};
