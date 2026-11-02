import { ExternalLink } from 'lucide-react';
import { PlatformIcon } from '../orbit-landing/Platforms';
import { PLATFORM_LABELS } from '../../constant/socialPlatforms';
import type { PostAccount } from '../../hooks/usePost';

const STATUS_TEXT: Record<string, string> = {
  published: 'Published',
  failed: 'Failed',
  pending: 'Pending',
  scheduled: 'Scheduled',
  deleted: 'Deleted from platform',
};

export function AccountLabel({ account }: { account: PostAccount }) {
  return (
    <span className="flex min-w-0 items-center gap-2">
      {account.platform && (
        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-[var(--surface-muted)] text-[var(--text)]">
          {/* The shared icon set names Twitter "x". */}
          <PlatformIcon platform={account.platform === 'twitter' ? 'x' : account.platform} className="size-3.5" />
        </span>
      )}
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium text-[var(--text)]">
          {account.platform ? PLATFORM_LABELS[account.platform] : 'Unknown platform'}
        </span>
        <span className="block truncate text-xs text-[var(--text-muted)]">
          {account.username ? `@${account.username.replace(/^@/, '')}` : account.connected ? 'Connected account' : 'Account no longer connected'}
        </span>
      </span>
    </span>
  );
}

// Read-only list of the accounts a post targets, with each account's publish outcome.
export function PostAccountsList({ accounts }: { accounts: PostAccount[] }) {
  if (accounts.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">No accounts selected.</p>;
  }

  return (
    <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]" data-testid="post-accounts-list">
      {accounts.map((account) => (
        <li key={account.accountId} className="flex items-center justify-between gap-3 px-3 py-2" data-testid={`post-account-${account.accountId}`}>
          <AccountLabel account={account} />
          <span className="flex shrink-0 flex-col items-end text-right">
            {account.result && (
              <span className="text-xs font-medium text-[var(--text-muted)]">
                {STATUS_TEXT[account.result.status] ?? account.result.status}
              </span>
            )}
            {account.result?.platformPostUrl && (
              <a
                href={account.result.platformPostUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-0.5 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View post <ExternalLink size={11} />
              </a>
            )}
            {account.result?.error && (
              <span className="mt-0.5 max-w-[200px] text-xs text-red-600">{account.result.error}</span>
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
