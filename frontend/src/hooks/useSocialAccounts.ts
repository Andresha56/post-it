import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '../lib/graphqlClient';
import {
  CONNECT_ACCOUNT, DISCONNECT_ACCOUNT, FETCH_CONNECTED_ACCOUNTS,
  type AccountPlatform, type SocialAccount
} from '../queries/account';

const ACCOUNTS_KEY = ['connected-accounts'];

export function useConnectedAccounts() {
  return useQuery({
    queryKey: ACCOUNTS_KEY,
    queryFn: async () =>
      (await graphqlRequest<{ fetchConnectedAccounts: SocialAccount[] }>(FETCH_CONNECTED_ACCOUNTS)).fetchConnectedAccounts
  });
}

// Resolves with the OAuth URL; the caller redirects the browser to it.
export function useConnectAccount() {
  return useMutation({
    mutationFn: async (platform: AccountPlatform) =>
      (await graphqlRequest<{ connectAccount: { authUrl: string } }>(CONNECT_ACCOUNT, { input: { platform } }))
        .connectAccount.authUrl
  });
}

export function useDisconnectAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (accountId: string) => graphqlRequest(DISCONNECT_ACCOUNT, { input: { accountId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ACCOUNTS_KEY })
  });
}
