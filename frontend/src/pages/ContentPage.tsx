import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Search, Plus } from 'lucide-react';
import { mockApi } from '../lib/mockApi';
import { PageHeading } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { StatusBadge } from '../components/ui/StatusBadge';

export function ContentPage() {
  const navigate = useNavigate();
  const { search } = useOutletContext<{ search: string }>();
  const { data = [], isLoading } = useQuery({ queryKey: ['posts'], queryFn: mockApi.getPosts });
  const filtered = data.filter((post) => post.title.toLowerCase().includes(search.toLowerCase()));
  return <div><PageHeading title="Content" description="Manage drafts, scheduled posts, and published content." actions={<Button onClick={() => navigate('/create')}><Plus size={16}/> Create post</Button>}/>
    <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--text-muted)]"><tr><th className="px-5 py-3">Post</th><th className="px-5 py-3">Platform</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Engagement</th></tr></thead><tbody className="divide-y divide-[var(--border)]">{isLoading ? <tr><td className="p-6 text-[var(--text-muted)]" colSpan={4}>Loading posts…</td></tr> : filtered.map((post) => <tr key={post.id} className="hover:bg-[var(--surface-muted)]"><td className="px-5 py-4"><div className="flex items-center gap-3">{post.imageUrl && <img src={post.imageUrl} alt="" className="size-12 rounded-lg object-cover"/>}<span className="font-semibold text-[var(--text)]">{post.title}</span></div></td><td className="px-5 py-4 text-[var(--text-muted)]">{post.platform}</td><td className="px-5 py-4"><StatusBadge status={post.status}/></td><td className="px-5 py-4 text-[var(--text-muted)]">{post.likes} likes · {post.comments} comments</td></tr>)}</tbody></table></div>{!isLoading && filtered.length === 0 && <p className="p-8 text-center text-sm text-[var(--text-muted)]"><Search className="mx-auto mb-2" size={20}/>No posts match your search.</p>}</Card>
  </div>;
}
