import { useQuery } from '@tanstack/react-query';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { format } from 'date-fns';
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

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-4">
      <PageHeading
        title={`${greeting}, Andresha`}
        description={`${format(new Date(), 'EEEE, MMMM d, yyyy')} · 3 posts scheduled this week`}
        actions={<Button variant="secondary" onClick={() => navigate('/calendar')}>View schedule</Button>}
      />

      <Card>
        <section aria-label="Performance metrics" className="grid grid-cols-2 divide-x divide-y divide-[var(--border)] lg:grid-cols-4 lg:divide-y-0">
          {data.metrics.map((metric) => <MetricCard key={metric.id} metric={metric}/>)}
        </section>
      </Card>

      <div className="grid min-w-0 grid-cols-1 gap-4 2xl:grid-cols-[minmax(0,2.2fr)_minmax(300px,1fr)]">
        <div className="min-w-0 space-y-4">
          <ContentCalendar posts={data.posts} onCreate={create}/>
          <PlatformPerformance/>
        </div>
        <div className="min-w-0 space-y-4">
          <AIAssistant/>
          <RecentPosts posts={posts} onViewAll={() => navigate('/content')}/>
        </div>
      </div>
    </div>
  );
}
