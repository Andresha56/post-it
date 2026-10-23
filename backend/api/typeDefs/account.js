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
  }
`;

module.exports = accountTypeDefs;
