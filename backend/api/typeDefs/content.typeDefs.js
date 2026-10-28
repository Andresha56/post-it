const { gql } = require("graphql-tag");

const contentTypeDefs = gql`
  enum ContentType {
    TEXT
    IMAGE
    VIDEO
    CAROUSEL
  }

  enum ContentStatus {
    DRAFT
    SCHEDULED
    PUBLISHED
    FAILED
  }

  type Content {
    id: ID
    userId: ID
    title: String
    platforms: [AccountPlatform!]
    caption: String!
    contentType: ContentType!
    mediaUrls: [String]
    hashtags: [String]
    accountIds: [ID]
    status: ContentStatus!
    scheduledAt: String
    publishedAt: String
    createdAt: String
    updatedAt: String
  }

  input CreateContentInput {
    title: String!
    platforms: [AccountPlatform!]!
    caption: String!
    contentType: ContentType!
    mediaUrls: [String]
    hashtags: [String]
    accountIds: [ID]
    status: ContentStatus
    scheduledAt: String
  }

  input UpdateContentInput {
    title: String
    caption: String!
    contentType: ContentType
    mediaUrls: [String]
    hashtags: [String]
    status: ContentStatus
    scheduledAt: String
  }

  type ContentResponse {
    success: Boolean
    message: String
    content: Content
  }

  type ContentsResponse {
    success: Boolean!
    message: String!
    contents: [Content!]!
    total: Int!
  }

  type Query {
    getContent(id: ID!): ContentResponse!

    getContents(
      page: Int
      limit: Int
      status: ContentStatus
      contentType: ContentType
    ): ContentsResponse!
  }

  type Mutation {
    createContent(input: CreateContentInput!): ContentResponse!

    updateContent(
      id: ID!
      input: UpdateContentInput!
    ): ContentResponse!

    deleteContent(id: ID!): ContentResponse!
  }
`;

module.exports = contentTypeDefs;
