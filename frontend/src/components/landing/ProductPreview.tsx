import { StatusBadge } from '../ui/StatusBadge';
import type { PostStatus, SocialPlatform } from '../../types';

type Slot = { day: string; date: number; posts: { time: string; title: string; platform: SocialPlatform; status: PostStatus }[] };

// Static, illustrative content that mirrors the real calendar's data shape and statuses.
const week: Slot[] = [
  { day: 'Mon', date: 20, posts: [{ time: '9:00 AM', title: '5 Productivity Tips for Remote Work', platform: 'Instagram', status: 'Published' }] },
  { day: 'Tue', date: 21, posts: [{ time: '8:00 AM', title: 'Building a Better Tomorrow', platform: 'LinkedIn', status: 'Published' }] },
  { day: 'Wed', date: 22, posts: [] },
  { day: 'Thu', date: 23, posts: [] },
  { day: 'Fri', date: 24, posts: [{ time: '12:00 PM', title: 'The Power of Consistency', platform: 'X', status: 'Scheduled' }] }
];

export function ProductPreview() {
  return (
    <div className="relative" aria-hidden="true">
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-soft">
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3.5">
          <p className="text-sm font-bold text-[var(--text)]">October 2026</p>
          <p className="text-xs text-[var(--text-muted)]">Week of Oct 20</p>
        </div>
        <ul className="divide-y divide-[var(--border)]">
          {week.map((slot) => (
            <li key={slot.day} className="flex gap-4 px-5 py-3.5">
              <div className="w-9 shrink-0 text-center">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--text-muted)]">{slot.day}</p>
                <p className="text-lg font-bold text-[var(--text)]">{slot.date}</p>
              </div>
              <div className="min-w-0 flex-1">
                {slot.posts.length === 0 ? (
                  <p className="pt-2.5 text-xs text-[var(--text-muted)]">Nothing scheduled</p>
                ) : slot.posts.map((post) => (
                  <div key={post.title} className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-3.5 py-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[var(--text)]">{post.title}</p>
                      <p className="mt-0.5 text-xs text-[var(--text-muted)]">{post.platform} · {post.time}</p>
                    </div>
                    <StatusBadge status={post.status} />
                  </div>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-soft sm:absolute sm:-bottom-8 sm:-left-8 sm:mt-0 sm:w-64">
        <p className="text-xs font-semibold text-[var(--text-muted)]">New post</p>
        <p className="mt-1.5 text-sm text-[var(--text)]">Our new feature is live!</p>
        <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
          <span className="text-[var(--text-muted)]">Oct 25 · 10:00 AM</span>
          <StatusBadge status="Scheduled" />
        </div>
      </div>
    </div>
  );
}
