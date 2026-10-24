const { gql } = require("graphql-tag");

const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    zernioProfileId: String
    createdAt: String
    updatedAt: String
  }

  input CreateUserInput {
    name: String!
    email: String!
    zernioProfileId: String
  }

  extend type Query {
    getUser(userId: ID!): User
  }

  extend type Mutation {
    createUser(input: CreateUserInput!): User!
  }
`;

module.exports = userTypeDefs;
