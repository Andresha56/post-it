import { ArrowUpRight, Heart, Send, Users, ChartNoAxesColumn } from 'lucide-react';
import { Card } from '../ui/Card';
import type { DashboardData } from '../../types';

const icons = { users: Users, reach: ChartNoAxesColumn, heart: Heart, send: Send };
const accents = [
  'bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300',
  'bg-sky-100 text-sky-600 dark:bg-sky-950 dark:text-sky-300',
  'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-300',
  'bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300'
];
const lines = ['M2 30 C16 28 16 24 27 25 S43 8 54 17 S74 4 90 2', 'M2 32 C17 29 20 20 31 24 S50 16 58 13 S77 7 90 1', 'M2 32 C14 29 18 27 28 18 S43 24 53 13 S73 9 90 1', 'M2 30 C15 28 19 22 30 24 S48 16 59 13 S78 8 90 1'];

export function MetricCard({ metric, index }: { metric: DashboardData['metrics'][number]; index: number }) {
  const Icon = icons[metric.icon];
  return (
    <Card className="relative min-w-0 overflow-hidden p-4">
      <div className="flex items-start gap-3">
        <span className={`grid size-10 shrink-0 place-items-center rounded-xl ${accents[index % accents.length]}`}><Icon size={19}/></span>
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[var(--text-muted)] sm:text-sm">{metric.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--text)]">{metric.value}</p>
          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-emerald-600"><ArrowUpRight size={14}/>{metric.change}</p>
        </div>
      </div>
      <svg viewBox="0 0 92 36" aria-hidden="true" className="absolute bottom-2 right-2 h-9 w-20 opacity-75">
        <path d={lines[index % lines.length]} fill="none" stroke={['#e83f63','#1688f5','#fb923c','#10b981'][index % 4]} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </Card>
  );
}
