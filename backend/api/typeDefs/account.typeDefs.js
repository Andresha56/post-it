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

  type SocialAccount {
    accountId: ID!
    platform: AccountPlatform!
    username: String
  }
  type Mutation {
    connectAccount(input: ConnectAccountInput!): Account
    disconnectAccount(input: DisconnectAccountInput!): Account
  }

  input ConnectAccountInput {
    platform: AccountPlatform!
  }

  input DisconnectAccountInput {
    accountId: ID!
  }

  type Query {
    getAccount(input: ID!): Account
    fetchConnectedAccounts: [SocialAccount!]!
  }
`;

module.exports = accountTypeDefs;
