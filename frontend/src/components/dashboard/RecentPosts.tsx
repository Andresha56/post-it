import { Eye, Heart, MessageCircle, MoreHorizontal } from 'lucide-react';
import type { Post } from '../../types';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';

export function RecentPosts({ posts, onViewAll }: { posts: Post[]; onViewAll: () => void }) {
  return (
    <Card>
      <CardHeader className="items-center">
        <div><h2 className="font-bold text-[var(--text)]">Recent Posts</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Your latest content</p></div>
        <Button variant="ghost" size="sm" onClick={onViewAll}>View all <span aria-hidden="true">→</span></Button>
      </CardHeader>
      <CardContent className="mt-2 divide-y divide-[var(--border)]">
        {posts.slice(0, 4).map((post) => (
          <article key={post.id} className="flex gap-3 py-3 first:pt-2">
            <img src={post.imageUrl ?? 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=160&q=80'} alt="" loading="lazy" className="size-[66px] shrink-0 rounded-xl bg-[var(--surface-muted)] object-cover"/>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="line-clamp-2 text-xs font-semibold leading-5 text-[var(--text)]">{post.title}</h3>
                <button aria-label={`More options for ${post.title}`} onClick={() => window.alert(`Actions for “${post.title}” will be connected later.`)} className="rounded-md p-1 text-[var(--text-muted)] hover:bg-[var(--surface-muted)]"><MoreHorizontal size={16}/></button>
              </div>
              <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">{post.status === 'Published' ? 'Recently published' : post.status === 'Scheduled' ? 'Scheduled post' : post.status}</p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1"><Eye size={12}/>{post.views ? Intl.NumberFormat('en', { notation: 'compact' }).format(post.views) : '—'}</span>
                  <span className="flex items-center gap-1"><Heart size={12}/>{post.likes || '—'}</span>
                  <span className="flex items-center gap-1"><MessageCircle size={12}/>{post.comments || '—'}</span>
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
