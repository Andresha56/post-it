import { Card, CardHeader, CardTitle } from '../ui/Card';

const platforms = [
  { name: 'Instagram', value: '48.2K', label: 'Followers', change: '12.1%' },
  { name: 'LinkedIn', value: '32.8K', label: 'Followers', change: '8.6%' },
  { name: 'X', value: '28.1K', label: 'Followers', change: '15.4%' },
  { name: 'TikTok', value: '16.7K', label: 'Followers', change: '22.3%' },
  { name: 'YouTube', value: '12.6K', label: 'Subscribers', change: '9.8%' }
];

export function PlatformPerformance() {
  return (
    <Card>
      <CardHeader className="items-center">
        <CardTitle title="Platform performance" description="Audience size and growth by platform" />
        <select aria-label="Performance period" className="h-7 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2 text-xs text-[var(--text)] outline-none focus:border-brand-500"><option>Last 30 days</option><option>Last 7 days</option><option>Last 90 days</option></select>
      </CardHeader>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[360px] text-sm">
          <thead>
            <tr className="border-y border-[var(--border)] bg-[var(--surface-muted)] text-left text-xs text-[var(--text-muted)]">
              <th scope="col" className="px-4 py-1.5 font-medium">Platform</th>
              <th scope="col" className="px-4 py-1.5 font-medium">Metric</th>
              <th scope="col" className="px-4 py-1.5 text-right font-medium">Total</th>
              <th scope="col" className="px-4 py-1.5 text-right font-medium">Change</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {platforms.map((platform) => (
              <tr key={platform.name}>
                <td className="px-4 py-2 font-medium text-[var(--text)]">{platform.name}</td>
                <td className="px-4 py-2 text-[var(--text-muted)]">{platform.label}</td>
                <td className="px-4 py-2 text-right tabular-nums text-[var(--text)]">{platform.value}</td>
                <td className="px-4 py-2 text-right tabular-nums text-emerald-600 dark:text-emerald-400">+{platform.change}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
