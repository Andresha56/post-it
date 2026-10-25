import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ImagePlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { mockApi } from '../lib/mockApi';
import { createPostSchema, type SocialPlatform } from '../types';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { inputClass, textareaClass, labelClass } from '../components/ui/Input';
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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Card><CardHeader><CardTitle title="Post content" /></CardHeader><CardContent className="space-y-4 pt-3">
          <label className={labelClass}>Caption<textarea value={title} onChange={(event) => setTitle(event.target.value)} rows={7} maxLength={500} placeholder="What would you like to share?" className={`${textareaClass} mt-1.5 font-normal`}/></label>
          <div className="flex items-center justify-between text-xs text-[var(--text-muted)]"><span>{title.length}/500 characters</span><button className="font-medium text-brand-600 hover:underline" onClick={() => { setTitle((current) => current || 'A small step today can lead to meaningful progress tomorrow. What are you working on this week?'); toast('Added a sample caption.'); }}> Draft with AI</button></div>
          <button onClick={() => toast('Media uploads will be connected to private S3 storage later.')} className="flex w-full items-center gap-3 rounded-lg border border-dashed border-[var(--border)] p-3 text-left transition-colors hover:border-brand-500 hover:bg-[var(--surface-muted)]"><ImagePlus size={18} className="text-[var(--text-muted)]"/><div><p className="text-sm font-medium text-[var(--text)]">Add media</p><p className="mt-1 text-xs text-[var(--text-muted)]">Image and video uploads will be enabled with S3.</p></div></button>
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
          <div className="flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => navigate('/content')}>Cancel</Button><Button onClick={submit} disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : status === 'Draft' ? 'Save draft' : 'Schedule post'}</Button></div>
        </CardContent></Card>
        <div className="space-y-4">
          <Card><CardHeader><CardTitle title="Publish settings" /></CardHeader><CardContent className="space-y-4 pt-3">
            <label className={labelClass}>Platform<select value={platform} onChange={(event) => setPlatform(event.target.value as SocialPlatform)} className={`${inputClass} mt-1.5 font-normal`}>{platforms.map((name) => <option key={name}>{name}</option>)}</select></label>
            <label className={labelClass}>Status<select value={status} onChange={(event) => setStatus(event.target.value as 'Draft' | 'Scheduled')} className={`${inputClass} mt-1.5 font-normal`}><option value="Draft">Save as draft</option><option value="Scheduled">Schedule</option></select></label>
            {status === 'Scheduled' && <label className={labelClass}>Date and time<input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} min={new Date().toISOString().slice(0,16)} className={`${inputClass} mt-1.5 font-normal`}/></label>}
          </CardContent></Card>
          <Card><CardHeader><CardTitle title="Preview" /></CardHeader><CardContent className="pt-3"><div className="rounded-lg border border-[var(--border)] p-3"><div className="mb-2 flex items-center gap-2"><span className="grid size-7 place-items-center rounded-full bg-[var(--surface-muted)] text-xs font-medium text-[var(--text)]">P</span><div><p className="text-[13px] font-medium leading-4 text-[var(--text)]">Orbit Workspace</p><p className="text-xs leading-4 text-[var(--text-muted)]">{platform}</p></div></div><p className="whitespace-pre-wrap break-words text-sm text-[var(--text)]">{title || 'Your caption preview will appear here.'}</p></div></CardContent></Card>
        </div>
      </div>
    </div>
  );
}
