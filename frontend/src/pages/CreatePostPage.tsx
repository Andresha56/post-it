import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ImagePlus, Send, CalendarClock } from 'lucide-react';
import toast from 'react-hot-toast';
import { mockApi } from '../lib/mockApi';
import { createPostSchema, type SocialPlatform } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { PageHeading } from '../components/layout/AppLayout';

const platforms: SocialPlatform[] = ['Instagram', 'LinkedIn', 'X', 'TikTok', 'YouTube'];

export function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<SocialPlatform>('Instagram');
  const [status, setStatus] = useState<'Draft' | 'Scheduled'>('Draft');
  const [scheduledAt, setScheduledAt] = useState('');
  const [error, setError] = useState('');
  const mutation = useMutation({
    mutationFn: mockApi.createPost,
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ['dashboard'] }); await queryClient.invalidateQueries({ queryKey: ['posts'] }); toast.success('Post saved'); navigate('/content'); },
    onError: () => toast.error('Could not save post. Try again.')
  });
  const submit = () => {
    const parsed = createPostSchema.safeParse({ title, platform, status, scheduledAt: status === 'Scheduled' ? scheduledAt : undefined });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? 'Check your post details.'); return; }
    if (status === 'Scheduled' && !scheduledAt) { setError('Choose a date and time to schedule this post.'); return; }
    setError('');
    mutation.mutate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading title="Create a post" description="Draft content and choose where and when to publish it."/>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Card><CardHeader><h2 className="font-bold text-[var(--text)]">Post content</h2></CardHeader><CardContent className="space-y-5 pt-4">
          <label className="block text-sm font-semibold text-[var(--text)]">Caption<textarea value={title} onChange={(event) => setTitle(event.target.value)} rows={7} maxLength={500} placeholder="What would you like to share?" className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 font-normal text-[var(--text)] outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15"/></label>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]"><span>{title.length}/500 characters</span><button className="inline-flex items-center gap-1 font-semibold text-brand-600" onClick={() => { setTitle((current) => current || 'A small step today can lead to meaningful progress tomorrow. What are you working on this week?'); toast('Added a sample caption.'); }}> <SparklesIcon/> Draft with AI</button></div>
          <button onClick={() => toast('Media uploads will be connected to private S3 storage later.')} className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[var(--border)] p-4 text-left hover:border-brand-500"><ImagePlus size={20} className="text-brand-600"/><div><p className="text-sm font-semibold text-[var(--text)]">Add media</p><p className="mt-1 text-xs text-[var(--text-muted)]">Image and video uploads will be enabled with S3.</p></div></button>
          {error && <p role="alert" className="text-sm font-medium text-red-600">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => navigate('/content')}>Cancel</Button><Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : status === 'Draft' ? 'Save draft' : 'Schedule post'}</Button></div>
        </CardContent></Card>
        <div className="space-y-5">
          <Card><CardHeader><h2 className="font-bold text-[var(--text)]">Publish settings</h2></CardHeader><CardContent className="space-y-4 pt-4">
            <label className="block text-sm font-medium text-[var(--text)]">Platform<select value={platform} onChange={(event) => setPlatform(event.target.value as SocialPlatform)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"><option>Instagram</option><option>LinkedIn</option><option>X</option><option>TikTok</option><option>YouTube</option></select></label>
            <label className="block text-sm font-medium text-[var(--text)]">Status<select value={status} onChange={(event) => setStatus(event.target.value as 'Draft' | 'Scheduled')} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"><option value="Draft">Save as draft</option><option value="Scheduled">Schedule</option></select></label>
            {status === 'Scheduled' && <label className="block text-sm font-medium text-[var(--text)]">Date and time<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} min={new Date().toISOString().slice(0,16)} className="mt-2 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm"/></label>}
          </CardContent></Card>
          <Card><CardHeader><h2 className="font-bold text-[var(--text)]">Preview</h2></CardHeader><CardContent className="pt-4"><div className="rounded-xl border border-[var(--border)] p-4"><div className="mb-3 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-full bg-brand-100 text-brand-700">P</span><div><p className="text-sm font-semibold text-[var(--text)]">PostFlow Workspace</p><p className="text-xs text-[var(--text-muted)]">{platform}</p></div></div><p className="whitespace-pre-wrap break-words text-sm text-[var(--text)]">{title || 'Your caption preview will appear here.'}</p></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
function SparklesIcon() { return <Send size={14}/>; }
