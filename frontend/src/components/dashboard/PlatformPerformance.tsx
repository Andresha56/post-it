import { Card, CardHeader, CardContent } from '../ui/Card';
import { Instagram, Linkedin, Youtube, TrendingUp } from 'lucide-react';

const platforms = [
  { name: 'Instagram', value: '48.2K', label: 'Followers', change: '12.1%', icon: Instagram, color: 'bg-gradient-to-br from-fuchsia-500 to-orange-400' },
  { name: 'LinkedIn', value: '32.8K', label: 'Followers', change: '8.6%', icon: Linkedin, color: 'bg-sky-600' },
  { name: 'X', value: '28.1K', label: 'Followers', change: '15.4%', icon: null, color: 'bg-black dark:bg-white dark:text-black' },
  { name: 'TikTok', value: '16.7K', label: 'Followers', change: '22.3%', icon: null, color: 'bg-slate-950 dark:bg-slate-700' },
  { name: 'YouTube', value: '12.6K', label: 'Subscribers', change: '9.8%', icon: Youtube, color: 'bg-red-600' }
];

export function PlatformPerformance() {
  return (
    <Card>
      <CardHeader>
        <div><h2 className="font-bold text-[var(--text)]">Platform Performance</h2><p className="mt-1 text-xs text-[var(--text-muted)]">Followers and engagement across platforms</p></div>
        <select aria-label="Performance period" className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 py-2 text-xs text-[var(--text)]"><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select>
      </CardHeader>
      <CardContent className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {platforms.map((platform) => {
          const Icon = platform.icon;
          return <div key={platform.name} className="rounded-xl border border-[var(--border)] p-3">
            <div className="flex items-center gap-2.5">
              <span className={`grid size-9 shrink-0 place-items-center rounded-xl text-white ${platform.color}`}>{Icon ? <Icon size={20}/> : <span className="text-sm font-bold">{platform.name === 'X' ? 'X' : '♪'}</span>}</span>
              <div className="min-w-0"><p className="font-bold text-[var(--text)]">{platform.value}</p><p className="text-[11px] text-[var(--text-muted)]">{platform.label}</p></div>
            </div>
            <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp size={13}/>{platform.change}</p>
          </div>;
        })}
      </CardContent>
    </Card>
  );
}
