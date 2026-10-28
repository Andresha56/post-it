import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Plus, Search } from 'lucide-react';
import { graphqlRequest } from '../lib/graphqlClient';
import { GET_CONTENTS } from '../queries/content';
import { PageHeading } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';
import type { PostStatus } from '../types';

type ContentRecord = {
  id: string;
  title: string | null;
  platforms: string[] | null;
  caption: string;
  contentType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL';
  mediaUrls: string[] | null;
  hashtags: string[] | null;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
  scheduledAt: string | null;
  createdAt: string | null;
};
type ContentListData = {
  getContents: { success: boolean; message: string; total: number; contents: ContentRecord[] };
};

const displayStatus: Record<ContentRecord['status'], PostStatus> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  FAILED: 'Failed',
};

export function ContentPage() {
  const navigate = useNavigate();
  const { search } = useOutletContext<{ search: string }>();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      const response = await graphqlRequest<ContentListData>(GET_CONTENTS, { page: 1, limit: 100 });
      if (!response.getContents.success) throw new Error(response.getContents.message || 'Could not load content.');
      return response.getContents.contents;
    },
  });
  const filtered = (data ?? []).filter((post) =>
    `${post.title ?? ''} ${post.caption} ${(post.hashtags ?? []).join(' ')}`.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeading
        title="Content"
        description="Manage drafts, scheduled posts, and published content."
        actions={<Button onClick={() => navigate('/create')}><Plus size={16} /> Create post</Button>}
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
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {isLoading && <tr><td className="p-6 text-[var(--text-muted)]" colSpan={4}>Loading posts…</td></tr>}
              {isError && <tr><td role="alert" className="p-6 text-red-600" colSpan={4}>{error instanceof Error ? error.message : 'Could not load posts.'}</td></tr>}
              {!isLoading && !isError && filtered.map((post) => (
                <tr key={post.id} className="hover:bg-[var(--surface-muted)]">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-[var(--text)]">{post.title?.trim() || post.caption}</p>
                    {!!post.platforms?.length && <p className="mt-1 text-xs text-[var(--text-muted)]">{post.platforms.join(', ')}</p>}
                    {!!post.hashtags?.length && <p className="mt-1 text-xs text-primary">{post.hashtags.join(' ')}</p>}
                    {!!post.mediaUrls?.length && <p className="mt-1 text-xs text-[var(--text-muted)]">{post.mediaUrls.length} media attachment{post.mediaUrls.length === 1 ? '' : 's'}</p>}
                  </td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">{post.contentType}</td>
                  <td className="px-5 py-4"><StatusBadge status={displayStatus[post.status]} /></td>
                  <td className="px-5 py-4 text-[var(--text-muted)]">
                    {post.scheduledAt ? new Date(post.scheduledAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && !isError && filtered.length === 0 && (
          <p className="p-8 text-center text-sm text-[var(--text-muted)]">
            <Search className="mx-auto mb-2" size={20} />No posts match your search.
          </p>
        )}
      </Card>
    </div>
  );
}
