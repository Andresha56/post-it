import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Sun, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { mockApi } from '../lib/mockApi';
import { MetricCard } from '../components/dashboard/MetricCard';
import { ContentCalendar } from '../components/dashboard/ContentCalendar';
import { RecentPosts } from '../components/dashboard/RecentPosts';
import { AIAssistant } from '../components/dashboard/AIAssistant';
import { PlatformPerformance } from '../components/dashboard/PlatformPerformance';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeading } from '../components/layout/AppLayout';

export function DashboardPage() {
  const navigate = useNavigate();
  const { search } = useOutletContext<{ search: string }>();
  const { data, isLoading, isError, refetch } = useQuery({ queryKey: ['dashboard'], queryFn: mockApi.getDashboard });
  const posts = (data?.posts ?? []).filter((post) => post.title.toLowerCase().includes(search.toLowerCase()));
  const create = () => navigate('/create');

  if (isLoading) return <div className="grid min-h-[60vh] place-items-center text-sm text-[var(--text-muted)]">Loading your workspace…</div>;
  if (isError || !data) return <div className="mx-auto max-w-lg py-20 text-center"><h1 className="text-xl font-bold">Could not load dashboard</h1><p className="mt-2 text-sm text-[var(--text-muted)]">Try the mock API again.</p><Button className="mt-4" onClick={() => void refetch()}>Retry</Button></div>;

  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-r from-rose-50 via-orange-50 to-white p-5 dark:border-rose-950 dark:from-[#3b202a] dark:via-[#29232b] dark:to-[var(--surface)] md:p-6">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]"><Sun size={15} className="text-orange-500"/> Tuesday, October 21, 2026</div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[var(--text)] md:text-3xl">Good morning, Rinki! <span aria-hidden="true">👋</span></h1>
          <p className="mt-2 text-sm text-[var(--text-muted)] md:text-base">Create, schedule and grow your social presence with AI.</p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-rose-100 bg-white/80 px-3 py-2 text-xs text-[var(--text)] dark:border-rose-900 dark:bg-black/10"><Sparkles size={15} className="text-brand-600"/> You have 3 posts scheduled this week <button className="font-semibold text-brand-600 hover:underline" onClick={() => navigate('/calendar')}>View schedule →</button></div>
        </div>
        <div className="pointer-events-none absolute -right-10 -top-16 hidden size-64 rounded-full bg-rose-200/40 blur-3xl md:block"/>
      </div>

      <section aria-label="Performance metrics" className="grid grid-cols-1 gap-3 sm:grid-cols-2 2xl:grid-cols-4">
        {data.metrics.map((metric, index) => <MetricCard key={metric.id} metric={metric} index={index}/>)}
      </section>

      <div className="grid min-w-0 grid-cols-1 gap-5 2xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,0.95fr)_minmax(290px,0.8fr)]">
        <div className="min-w-0 space-y-5 2xl:col-span-2">
          <ContentCalendar posts={data.posts} onCreate={create}/>
          <PlatformPerformance/>
        </div>
        <div className="min-w-0 space-y-5">
          <AIAssistant/>
          <RecentPosts posts={posts} onViewAll={() => navigate('/content')}/>
          <Card className="bg-gradient-to-br from-rose-50 to-orange-50 p-5 dark:from-rose-950/40 dark:to-orange-950/20">
            <div className="flex items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-white/10"><Sparkles size={19}/></span><div><h2 className="font-bold text-[var(--text)]">Plan a campaign with AI</h2><p className="mt-1 text-xs leading-5 text-[var(--text-muted)]">Build a coordinated content plan for your next campaign.</p></div></div>
            <Button className="mt-4" onClick={() => { navigate('/ai-studio'); toast('AI Studio is ready for your next idea.'); }}>Try AI Studio</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
