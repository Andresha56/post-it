
const { gql } = require("graphql-tag");

const mergedTypeDefs = gql`
    type Query {
        health: String!
    }
`;

const mergedResolvers = {
    Query: {
        health: () => "GraphQL API is running!",
    },
};

module.exports = {
    mergedTypeDefs,
    mergedResolvers,
};
