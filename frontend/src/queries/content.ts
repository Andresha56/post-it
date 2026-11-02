export const CREATE_CONTENT = `
  mutation CreateContent($input: CreateContentInput!) {
    createContent(input: $input) {
      success
      message
      content {
        id
        title
        platforms
        caption
        contentType
        status
        statusReason
        zernioPostId
        mediaUrls
        hashtags
        accountIds
        accountResults {
          accountId
          platform
          status
          platformPostUrl
          error
        }
        scheduledAt
        publishedAt
        createdAt
      }
    }
  }
`;

export const CREATE_UPLOAD_URL = `
  mutation CreateUploadUrl($input: CreateUploadUrlInput!) {
    createUploadUrl(input: $input) {
      uploadUrl
      key
    }
  }
`;

export const GET_CONTENTS = `
  query GetContents($page: Int, $limit: Int, $status: ContentStatus, $contentType: ContentType) {
    getContents(page: $page, limit: $limit, status: $status, contentType: $contentType) {
      success
      message
      total
      contents {
        id
        title
        platforms
        caption
        contentType
        mediaUrls
        hashtags
        accountIds
        accountResults {
          accountId
          platform
          status
          platformPostUrl
          error
        }
        status
        statusReason
        scheduledAt
        publishedAt
        createdAt
      }
    }
  }
`;

// Full post details for the view modal and edit screen, including signed media URLs.
const CONTENT_DETAIL_FIELDS = `
  id
  title
  platforms
  caption
  contentType
  mediaUrls
  mediaPreviewUrls
  hashtags
  accountIds
  accountResults {
    accountId
    platform
    status
    platformPostId
    platformPostUrl
    error
  }
  status
  statusReason
  zernioPostId
  scheduledAt
  publishedAt
  createdAt
`;

export const GET_CONTENT = `
  query GetContent($id: ID!) {
    getContent(id: $id) {
      success
      message
      content { ${CONTENT_DETAIL_FIELDS} }
    }
  }
`;

const ACTION_RESULTS = `
  results {
    accountId
    platform
    status
    message
  }
`;

export const UPDATE_CONTENT = `
  mutation UpdateContent($id: ID!, $input: UpdateContentInput!) {
    updateContent(id: $id, input: $input) {
      success
      message
      content { id status statusReason }
      ${ACTION_RESULTS}
    }
  }
`;

export const DELETE_CONTENT = `
  mutation DeleteContent($id: ID!, $scope: DeleteScope, $accountIds: [ID!]) {
    deleteContent(id: $id, scope: $scope, accountIds: $accountIds) {
      success
      message
      content { id status statusReason }
      ${ACTION_RESULTS}
    }
  }
`;
