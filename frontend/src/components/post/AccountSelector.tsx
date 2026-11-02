import type { ElementType } from "react";
import {
  Facebook,
  Instagram,
  Linkedin,
  Loader2,
  Plug,
  Twitter,
  Youtube,
} from "lucide-react";
import { Link } from "react-router-dom";

import { ThreadsIcon } from "../ui/BrandIcons";
import { Button } from "../ui/Button";
import { PLATFORM_LABELS, SOCIAL_PLATFORMS } from "../../constant/socialPlatforms";
import type { SocialAccount } from "../../queries/account";
import type { SocialPlatform } from "../../constant/socialPlatforms";

const PLATFORM_ICONS: Record<SocialPlatform, ElementType> = {
  [SOCIAL_PLATFORMS.FACEBOOK]: Facebook,
  [SOCIAL_PLATFORMS.INSTAGRAM]: Instagram,
  [SOCIAL_PLATFORMS.TWITTER]: Twitter,
  [SOCIAL_PLATFORMS.YOUTUBE]: Youtube,
  [SOCIAL_PLATFORMS.THREADS]: ThreadsIcon,
  [SOCIAL_PLATFORMS.LINKEDIN]: Linkedin,
};

type Props = {
  accounts: SocialAccount[];
  selected: string[];
  onChange: (accountIds: string[]) => void;
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetry: () => void;
};

/**
 * Lists only the accounts Zernio reports as connected. Several accounts can be
 * selected at once, including more than one on the same platform.
 */
export function AccountSelector({
  accounts,
  selected,
  onChange,
  isLoading,
  isError,
  errorMessage,
  onRetry,
}: Props) {
  const toggle = (accountId: string) =>
    onChange(
      selected.includes(accountId)
        ? selected.filter((id) => id !== accountId)
        : [...selected, accountId],
    );

  if (isLoading) {
    return (
      <p
        data-testid="accounts-loading"
        className="mt-1.5 flex items-center gap-2 text-sm font-normal text-[var(--text-muted)]"
      >
        <Loader2 size={15} className="animate-spin" /> Loading your connected
        accounts…
      </p>
    );
  }

  if (isError) {
    return (
      <div data-testid="accounts-error" className="mt-1.5 space-y-2">
        <p className="text-sm font-normal text-error">
          {errorMessage ?? "Could not load your connected accounts."}
        </p>
        <Button
          data-testid="accounts-retry-button"
          size="sm"
          variant="secondary"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (accounts.length === 0) {
    return (
      <div
        data-testid="no-connected-accounts"
        className="mt-1.5 space-y-2 rounded-lg border border-dashed border-[var(--border)] p-3"
      >
        <p className="text-sm font-normal text-[var(--text-muted)]">
          No social accounts are connected yet. Connect one to publish or
          schedule this post.
        </p>
        <Link to="/social-accounts">
          <Button data-testid="connect-account-link" size="sm" variant="secondary">
            <Plug size={15} /> Connect an account
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <ul data-testid="account-selector" className="mt-1.5 space-y-1.5">
      {accounts.map(({ accountId, platform, username }) => {
        const Icon = PLATFORM_ICONS[platform] ?? Plug;
        const label = PLATFORM_LABELS[platform] ?? platform;
        const isSelected = selected.includes(accountId);

        return (
          <li key={accountId}>
            <label
              className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-[var(--border)] px-2.5 py-2 transition-colors hover:bg-[var(--surface-muted)]"
              data-testid={`account-option-${accountId}`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(accountId)}
                className="size-4 accent-[var(--primary)]"
                data-testid={`account-checkbox-${accountId}`}
              />
              <Icon size={15} className="text-[var(--text-muted)]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-[var(--text)]">
                  {username ? `@${username}` : label}
                </span>
                <span className="block text-xs font-normal text-[var(--text-muted)]">
                  {label}
                </span>
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}
