import { Eye, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import type { Post } from '../../types';
import { Card, CardHeader, CardContent, CardTitle } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';

export function RecentPosts({ posts, onViewAll }: { posts: Post[]; onViewAll: () => void }) {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle title="Recent posts" />
        <Button variant="ghost" size="sm" onClick={onViewAll}>View all</Button>
      </CardHeader>
      <CardContent className="mt-2 divide-y divide-[var(--border)]">
        {posts.length === 0 && <p className="py-6 text-center text-sm text-[var(--text-muted)]">No posts match your search.</p>}
        {posts.slice(0, 4).map((post) => (
          <article key={post.id} className="flex gap-3 py-3 first:pt-2 last:pb-0">
            <img src={post.imageUrl ?? 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=160&q=80'} alt="" loading="lazy" className="size-12 shrink-0 rounded-md bg-[var(--surface-muted)] object-cover"/>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-[13px] font-medium leading-5 text-[var(--text)]">{post.title}</h3>
                <button aria-label={`More options for ${post.title}`} title="More options" onClick={() => window.alert(`Actions for “${post.title}” will be connected later.`)} className="-mr-1 rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--text)]"><MoreHorizontal size={15}/></button>
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs tabular-nums text-[var(--text-muted)]">
                  <span className="flex items-center gap-1" title="Views"><Eye size={12}/>{post.views ? Intl.NumberFormat('en', { notation: 'compact' }).format(post.views) : '—'}</span>
                  <span className="flex items-center gap-1" title="Likes"><Heart size={12}/>{post.likes || '—'}</span>
                  <span className="flex items-center gap-1" title="Comments"><MessageCircle size={12}/>{post.comments || '—'}</span>
                </div>
                <StatusBadge status={post.status}/>
              </div>
            </div>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}
