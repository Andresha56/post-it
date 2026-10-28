import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Facebook, Instagram, Linkedin, Loader2, Plug, Plus, Unplug, X, Youtube } from 'lucide-react';
import toast from 'react-hot-toast';
import { PageHeading } from '../components/layout/AppLayout';
import { Button } from '../components/ui/Button';
import { useConnectAccount, useConnectedAccounts, useDisconnectAccount } from '../hooks/useSocialAccounts';
import type { AccountPlatform } from '../queries/account';

// Only platforms accepted by both the AccountPlatform enum and the connectAccount resolver.
const platforms: { value: AccountPlatform; label: string; icon: typeof Plug }[] = [
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'youtube', label: 'YouTube', icon: Youtube }
];
const platformMeta = Object.fromEntries(platforms.map((p) => [p.value, p])) as Record<AccountPlatform, (typeof platforms)[number]>;

const errorText = (error: unknown) => (error instanceof Error ? error.message : 'Something went wrong');

export function SocialAccountsPage() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<AccountPlatform[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);
  const accounts = useConnectedAccounts();
  const connect = useConnectAccount();
  const disconnect = useDisconnectAccount();

  const available = platforms.filter((p) => !pending.includes(p.value));

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const addPlatform = (platform: AccountPlatform) => {
    setPending((c) => [...c, platform]);
    setOpen(false);
  };

  const handleConnect = (platform: AccountPlatform) => {
    connect.mutate(platform, {
      onSuccess: (authUrl) => window.location.assign(authUrl),
      onError: (error) => toast.error(errorText(error))
    });
  };

  const handleDisconnect = (accountId: string, label: string) => {
    disconnect.mutate(accountId, {
      onSuccess: () => toast.success(`${label} disconnected`),
      onError: (error) => toast.error(errorText(error))
    });
  };

  return (
    <div>
      <PageHeading title="Social accounts" description="Manage the social channels connected to your workspace." />
      <div className="relative inline-block" ref={menuRef}>
        <Button variant="secondary" disabled={available.length === 0} onClick={() => setOpen((o) => !o)}>
          <Plus size={15} /> Add platform <ChevronDown size={15} />
        </Button>
        {open && (
          <div className="absolute left-0 z-20 mt-2 w-52 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)] py-1 shadow-lg">
            {available.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-[var(--text)] hover:bg-[var(--surface-muted)]"
                onClick={() => addPlatform(value)}
              >
                <Icon size={16} className="text-[var(--text-muted)]" />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {accounts.isPending ? (
        <p className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
          <Loader2 size={15} className="animate-spin" /> Loading accounts…
        </p>
      ) : accounts.isError ? (
        <div className="mt-4 flex items-center gap-3 text-sm">
          <p className="text-error">{errorText(accounts.error)}</p>
          <Button size="sm" variant="secondary" onClick={() => void accounts.refetch()}>Retry</Button>
        </div>
      ) : accounts.data.length === 0 && pending.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--text-muted)]">No accounts connected yet. Use “Add platform” to get started.</p>
      ) : (
        <ul className="mt-4 divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
          {pending.map((platform) => {
            const { label, icon: Icon } = platformMeta[platform];
            const isConnecting = connect.isPending && connect.variables === platform;
            return (
              <li key={platform} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
                  <Icon size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text)]">{label}</p>
                  <p className="text-xs text-[var(--text-muted)]">Not connected</p>
                </div>
                <Button variant="secondary" disabled={connect.isPending} onClick={() => handleConnect(platform)}>
                  {isConnecting ? <Loader2 size={15} className="animate-spin" /> : <Plug size={15} />}
                  {isConnecting ? 'Redirecting…' : 'Connect'}
                </Button>
                <button
                  type="button"
                  aria-label={`Remove ${label}`}
                  className="text-[var(--text-muted)] hover:text-[var(--text)]"
                  onClick={() => setPending((c) => c.filter((p) => p !== platform))}
                >
                  <X size={16} />
                </button>
              </li>
            );
          })}
          {accounts.data.map(({ accountId, platform, username }) => {
            const { label, icon: Icon } = platformMeta[platform] ?? { label: platform, icon: Plug };
            const isDisconnecting = disconnect.isPending && disconnect.variables === accountId;
            return (
              <li key={accountId} className="flex items-center gap-3 px-4 py-3">
                <span className="grid size-8 place-items-center rounded-lg bg-[var(--surface-muted)] text-[var(--text-muted)]">
                  <Icon size={16} />
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--text)]">{username ? `@${username}` : label}</p>
                  <p className="text-xs text-success">{label} · Connected</p>
                </div>
                <Button variant="secondary" disabled={isDisconnecting} onClick={() => handleDisconnect(accountId, label)}>
                  {isDisconnecting ? <Loader2 size={15} className="animate-spin" /> : <Unplug size={15} />} Disconnect
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
