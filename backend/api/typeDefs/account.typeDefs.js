const { gql } = require("graphql-tag");

const accountTypeDefs = gql`
  enum AccountPlatform {
    instagram
    x
    facebook
    linkedin
    youtube
  }

  enum AccountStatus {
    connected
    disconnected
  }

  type Account {
    id: ID!
    sub: String!
    platform: AccountPlatform!
    zernioAccountId: String!
    status: AccountStatus!
    avatarUrl: String
    createdAt: String
    updatedAt: String
    authUrl: String
  }
  type Mutation {
    connectAccount(input: ConnectAccountInput!): Account
  }

  input ConnectAccountInput {
    platform: AccountPlatform!
  }

  type Query {
    getAccount(input: ID!): Account
  }
`;

module.exports = accountTypeDefs;
