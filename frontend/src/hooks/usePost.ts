import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { graphqlRequest } from '../lib/graphqlClient';
import { DELETE_CONTENT, GET_CONTENT } from '../queries/content';
import { useConnectedAccounts } from './useSocialAccounts';
import type {
  AccountResult,
  ContentDetailData,
  ContentMutationResult,
  ContentRecord,
  DeleteScope,
  SocialPlatform,
} from '../constant/content';

// Full details of one post, including signed media URLs.
export function usePost(id: string | undefined) {
  return useQuery({
    queryKey: ['post', id],
    enabled: Boolean(id),
    queryFn: async () => {
      const result = (await graphqlRequest<ContentDetailData>(GET_CONTENT, { id })).getContent;
      if (!result.success || !result.content) throw new Error(result.message || 'Post not found.');
      return result.content;
    },
  });
}

export type PostAccount = {
  accountId: string;
  platform: SocialPlatform | null;
  username: string | null;
  connected: boolean;
  result: AccountResult | null;
};

// The post's selected accounts joined with their publish outcome and the
// username from the currently connected accounts.
export function usePostAccounts(post: ContentRecord | null | undefined): PostAccount[] {
  const { data: connected = [] } = useConnectedAccounts();
  if (!post) return [];

  const ids = [
    ...new Set([
      ...(post.accountIds ?? []),
      ...(post.accountResults ?? []).map((result) => result.accountId),
    ]),
  ];

  return ids.map((accountId) => {
    const account = connected.find((item) => item.accountId === accountId);
    const result = post.accountResults?.find((item) => item.accountId === accountId) ?? null;
    return {
      accountId,
      platform: result?.platform ?? account?.platform ?? null,
      username: account?.username ?? null,
      connected: Boolean(account),
      result,
    };
  });
}

type DeleteVariables = { id: string; scope: DeleteScope; accountIds?: string[] };

// Resolves with the backend's real outcome; `success: false` means the post was kept.
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, scope, accountIds }: DeleteVariables) =>
      (
        await graphqlRequest<{ deleteContent: ContentMutationResult }>(DELETE_CONTENT, {
          id,
          scope,
          accountIds: accountIds?.length ? accountIds : undefined,
        })
      ).deleteContent,
    onSettled: (data, _error, { id }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        // A deleted post must not be refetched while its dialog closes.
        queryClient.invalidateQueries({ queryKey: ['post', id], refetchType: data?.success ? 'none' : 'active' }),
      ]),
  });
}
