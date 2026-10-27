const { gql } = require("graphql-tag");

const uploadTypeDefs = gql`
  input CreateUploadUrlInput {
    contentType: String!
    fileSize: Int!
  }

  type UploadUrlPayload {
    uploadUrl: String!
    key: String!
  }

  extend type Mutation {
    createUploadUrl(input: CreateUploadUrlInput!): UploadUrlPayload!
  }
`;
module.exports = uploadTypeDefs;
