
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Eye, Pencil, Plus, Search, Trash2 } from 'lucide-react';

import { graphqlRequest } from '../lib/graphqlClient';
import { GET_CONTENTS } from '../queries/content';
import { PageHeading } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import { DISPLAY_STATUS, type ContentListData, type ContentRecord } from '../constant/content';
import { usePostActions } from '../hooks/usePostActions';

const formatScheduledAt = (value: string | null) => {
  if (!value) return '—';

  return new Date(Number(value)).toLocaleString();
};

const getPostTitle = (post: ContentRecord) =>
  post.title?.trim() || post.caption;

const matchesSearch = (post: ContentRecord, search: string) => {
  const searchableContent = [
    post.title,
    post.caption,
    ...(post.hashtags ?? []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchableContent.includes(search.toLowerCase());
};

export function ContentPage() {
  const navigate = useNavigate();
  const { search } = useOutletContext<{ search: string }>();
  const actions = usePostActions();

  const {
    data: posts = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await graphqlRequest<ContentListData>(
        GET_CONTENTS,
        { page: 1, limit: 100 },
      );

      const result = response.getContents;

      if (!result.success) {
        throw new Error(result.message || 'Could not load content.');
      }

      return result.contents;
    },
  });

  const filteredPosts = posts.filter((post) =>
    matchesSearch(post, search),
  );

  const handleCreatePost = () => navigate('/create');

  return (
    <div>
      <PageHeading
        title="Content"
        description="Manage drafts, scheduled posts, and published content."
        actions={
          <Button onClick={handleCreatePost}>
            <Plus size={16} />
            Create post
          </Button>
        }
      />

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-muted)]">
              <tr>
                <th className="px-5 py-3">Post</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Schedule</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--border)]">
              {isLoading && (
                <tr>
                  <td colSpan={5} className="p-6 text-[var(--text-muted)]">
                    Loading posts…
                  </td>
                </tr>
              )}

              {isError && (
                <tr>
                  <td colSpan={5} role="alert" className="p-6 text-red-600">
                    {error instanceof Error
                      ? error.message
                      : 'Could not load posts.'}
                  </td>
                </tr>
              )}

              {!isLoading &&
                !isError &&
                filteredPosts.map((post) => (
                  <tr
                    key={post.id}
                    className="hover:bg-[var(--surface-muted)]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-semibold text-[var(--text)]">
                        {getPostTitle(post)}
                      </p>

                      {post.platforms?.length ? (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {post.platforms.join(', ')}
                        </p>
                      ) : null}

                      {post.hashtags?.length ? (
                        <p className="mt-1 text-xs text-primary">
                          {post.hashtags.join(' ')}
                        </p>
                      ) : null}

                      {post.mediaUrls?.length ? (
                        <p className="mt-1 text-xs text-[var(--text-muted)]">
                          {post.mediaUrls.length} media attachment
                          {post.mediaUrls.length === 1 ? '' : 's'}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-muted)]">
                      {post.contentType}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={DISPLAY_STATUS[post.status]} />

                      {post.statusReason ? (
                        <p
                          className="mt-1 max-w-[220px] text-xs text-[var(--text-muted)]"
                          data-testid={`post-status-reason-${post.id}`}
                        >
                          {post.statusReason}
                        </p>
                      ) : null}
                    </td>

                    <td className="px-5 py-4 text-[var(--text-muted)]">
                      {formatScheduledAt(post.scheduledAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`View ${getPostTitle(post)}`}
                          title="View"
                          onClick={() => actions.view(post.id)}
                          data-testid={`post-view-button-${post.id}`}
                        >
                          <Eye size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8"
                          aria-label={`Edit ${getPostTitle(post)}`}
                          title="Edit"
                          onClick={() => actions.edit(post.id)}
                          data-testid={`post-edit-button-${post.id}`}
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 hover:text-red-600"
                          aria-label={`Delete ${getPostTitle(post)}`}
                          title="Delete"
                          onClick={() => actions.remove(post.id)}
                          data-testid={`post-delete-button-${post.id}`}
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {!isLoading && !isError && filteredPosts.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--text-muted)]">
            <Search className="mx-auto mb-2" size={20} />
            No posts match your search.
          </p>
        )}
      </Card>
      {actions.dialogs}
    </div>
  );
}
