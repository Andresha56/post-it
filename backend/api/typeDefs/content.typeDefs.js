const { gql } = require("graphql-tag");
const { CONTENT_STATUS_LIST } = require("../constants/contentStatus");

const contentTypeDefs = gql`
  enum ContentType {
    TEXT
    IMAGE
    VIDEO
    CAROUSEL
  }

  enum ContentStatus {
    ${CONTENT_STATUS_LIST.join("\n    ")}
  }

  type AccountResult {
    accountId: ID!
    platform: AccountPlatform!
    status: String!
    platformPostId: String
    platformPostUrl: String
    error: String
  }

  # Outcome of an edit or delete on one connected account's copy of a post:
  # updated | deleted | cancelled | unsupported | failed | skipped
  type AccountActionResult {
    accountId: ID!
    platform: AccountPlatform!
    status: String!
    message: String
  }

  enum DeleteScope {
    APP_ONLY
    APP_AND_SOCIAL
  }

  type Content {
    id: ID
    userId: ID
    title: String
    platforms: [AccountPlatform!]
    caption: String!
    contentType: ContentType!
    mediaUrls: [String]
    # Short-lived signed URLs for displaying the private S3 media.
    mediaPreviewUrls: [String!]
    hashtags: [String]
    accountIds: [ID]
    accountResults: [AccountResult!]
    status: ContentStatus!
    statusReason: String
    zernioPostId: String
    scheduledAt: String
    publishedAt: String
    createdAt: String
    updatedAt: String
  }

  input CreateContentInput {
    title: String!
    caption: String!
    contentType: ContentType!
    mediaUrls: [String]
    hashtags: [String]
    accountIds: [ID!]
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
    results: [AccountActionResult!]
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

    deleteContent(
      id: ID!
      scope: DeleteScope = APP_ONLY
      accountIds: [ID!]
    ): ContentResponse!
  }
`;

module.exports = contentTypeDefs;
