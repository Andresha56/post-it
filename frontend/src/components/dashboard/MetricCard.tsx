import type { DashboardData } from '../../types';

// A single cell of the stats strip; the surrounding Card and dividers live in DashboardPage.
export function MetricCard({ metric }: { metric: DashboardData['metrics'][number] }) {
  return (
    <div className="min-w-0 px-4 py-3.5">
      <p className="truncate text-xs text-[var(--text-muted)]">{metric.label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-xl font-semibold tabular-nums tracking-tight text-[var(--text)]">{metric.value}</p>
        <p className="text-xs font-medium tabular-nums text-success">{metric.change}</p>
      </div>
    </div>
  );
}
