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
