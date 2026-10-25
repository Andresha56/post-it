export type AccountPlatform = 'facebook' | 'instagram' | 'linkedin' | 'youtube';

export type SocialAccount = {
  accountId: string;
  platform: AccountPlatform;
  username: string | null;
};

export const FETCH_CONNECTED_ACCOUNTS = /* GraphQL */ `
  query FetchConnectedAccounts {
    fetchConnectedAccounts {
      accountId
      platform
      username
    }
  }
`;

export const CONNECT_ACCOUNT = /* GraphQL */ `
  mutation ConnectAccount($input: ConnectAccountInput!) {
    connectAccount(input: $input) {
      authUrl
    }
  }
`;

// The resolver returns { success, message } although the schema types the result as Account,
// so only a nullable Account field can be selected here; a failure arrives as a GraphQL error.
export const DISCONNECT_ACCOUNT = /* GraphQL */ `
  mutation DisconnectAccount($input: DisconnectAccountInput!) {
    disconnectAccount(input: $input) {
      updatedAt
    }
  }
`;
