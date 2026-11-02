import { useState } from 'react';
import toast from 'react-hot-toast';
import { Loader2, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AccountLabel } from './PostAccountsList';
import { useDeletePost, usePost, usePostAccounts } from '../../hooks/usePost';
import {
  Status,
  UNPUBLISHABLE_PLATFORMS,
  formatContentDate,
  type AccountActionResult,
  type DeleteScope,
} from '../../constant/content';
import { PLATFORM_LABELS } from '../../constant/socialPlatforms';
import { cn } from '../../lib/utils';

const RESULT_TEXT: Record<string, string> = {
  deleted: 'Deleted',
  failed: 'Failed',
  unsupported: 'Not supported',
};

function ScopeOption({
  value,
  scope,
  onSelect,
  title,
  description,
  disabled,
}: {
  value: DeleteScope;
  scope: DeleteScope;
  onSelect: (scope: DeleteScope) => void;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
        scope === value ? 'border-primary bg-primary/5' : 'border-[var(--border)] hover:bg-[var(--surface-muted)]',
        disabled && 'cursor-not-allowed opacity-50',
      )}
    >
      <input
        type="radio"
        name="delete-scope"
        value={value}
        checked={scope === value}
        disabled={disabled}
        onChange={() => onSelect(value)}
        data-testid={`delete-scope-${value.toLowerCase().replace(/_/g, '-')}`}
        className="mt-0.5 accent-[rgb(var(--primary))]"
      />
      <span>
        <span className="block text-sm font-medium text-[var(--text)]">{title}</span>
        <span className="mt-0.5 block text-xs text-[var(--text-muted)]">{description}</span>
      </span>
    </label>
  );
}

export function DeletePostModal({ postId, onClose }: { postId: string | null; onClose: () => void }) {
  const { data: post, isLoading } = usePost(postId ?? undefined);
  const accounts = usePostAccounts(post);
  const remove = useDeletePost();
  const [scope, setScope] = useState<DeleteScope>('APP_ONLY');
  const [deselected, setDeselected] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<{ message: string; results: AccountActionResult[] } | null>(null);

  const isPublished = post?.status === Status.PUBLISHED;
  const isScheduled = post?.status === Status.SCHEDULED;
  const isPublishing = post?.status === Status.PUBLISHING;
  const published = accounts.filter((account) => account.result?.status === 'published');
  const canUnpublish = (platform: string | null) =>
    Boolean(platform && (UNPUBLISHABLE_PLATFORMS as readonly string[]).includes(platform));
  const selectable = published.filter((account) => canUnpublish(account.platform));
  const selected = selectable.filter((account) => !deselected.includes(account.accountId));
  const keptLive = published.filter(
    (account) => !canUnpublish(account.platform) || deselected.includes(account.accountId),
  );

  const close = () => {
    setScope('APP_ONLY');
    setDeselected([]);
    setOutcome(null);
    remove.reset();
    onClose();
  };

  const confirm = async () => {
    if (!post) return;
    setOutcome(null);
    try {
      const socialScope = isPublished && scope === 'APP_AND_SOCIAL';
      const result = await remove.mutateAsync({
        id: post.id,
        scope: socialScope ? 'APP_AND_SOCIAL' : 'APP_ONLY',
        accountIds: socialScope ? selected.map((account) => account.accountId) : undefined,
      });
      if (!result.success) {
        // The post was kept: show exactly which accounts succeeded and failed.
        setOutcome({ message: result.message, results: result.results ?? [] });
        return;
      }
      const notDeleted = (result.results ?? []).some((item) => item.status !== 'deleted');
      if (notDeleted) toast(result.message, { duration: 7000 });
      else toast.success(result.message || 'Post deleted');
      close();
    } catch (error) {
      setOutcome({ message: error instanceof Error ? error.message : 'Could not delete the post.', results: [] });
    }
  };

  const disableConfirm =
    !post || remove.isPending || isPublishing || (isPublished && scope === 'APP_AND_SOCIAL' && selected.length === 0);

  return (
    <Modal
      open={Boolean(postId)}
      onOpenChange={(open) => !open && close()}
      title="Delete post"
      description={post?.title ? `“${post.title}”` : undefined}
      testId="delete-post-modal"
      footer={
        <>
          <Button variant="ghost" onClick={close} disabled={remove.isPending} data-testid="delete-post-cancel-button">
            Cancel
          </Button>
          <Button variant="danger" onClick={confirm} disabled={disableConfirm} data-testid="delete-post-confirm-button">
            {remove.isPending ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
            {remove.isPending ? 'Deleting…' : 'Delete post'}
          </Button>
        </>
      }
    >
      {isLoading && (
        <p className="flex items-center gap-2 py-4 text-sm text-[var(--text-muted)]">
          <Loader2 size={15} className="animate-spin" /> Loading post…
        </p>
      )}

      {post && (
        <div className="space-y-3">
          {isScheduled && (
            <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)]" data-testid="delete-post-scheduled-note">
              This post has not been published yet. Deleting it cancels its scheduled publishing
              ({formatContentDate(post.scheduledAt)}) through Zernio, so nothing will be posted.
            </p>
          )}
          {isPublishing && (
            <p role="alert" className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-sm text-[var(--text)]">
              This post is being published right now. Wait for it to finish, then delete it.
            </p>
          )}

          <ScopeOption
            value="APP_ONLY"
            scope={scope}
            onSelect={setScope}
            title="Delete from this platform only"
            description={
              isPublished
                ? 'Removes the post from your content. It stays live on your social media accounts.'
                : isScheduled
                  ? 'Removes the post from your content and cancels its scheduled publishing.'
                  : 'Removes the post from your content.'
            }
          />
          <ScopeOption
            value="APP_AND_SOCIAL"
            scope={scope}
            onSelect={setScope}
            disabled={!isPublished}
            title="Delete from this platform and social media account(s)"
            description={
              isPublished
                ? 'Removes the post from your content and deletes it from the accounts you choose below.'
                : 'Nothing has been published yet, so there is nothing to remove from social media.'
            }
          />

          {isPublished && scope === 'APP_AND_SOCIAL' && (
            <div className="space-y-2" data-testid="delete-post-accounts">
              <p className="text-xs font-medium uppercase text-[var(--text-muted)]">Delete from</p>
              <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)]">
                {published.map((account) => {
                  const supported = canUnpublish(account.platform);
                  return (
                    <li key={account.accountId}>
                      <label className={cn('flex items-center justify-between gap-3 px-3 py-2', supported ? 'cursor-pointer' : 'opacity-60')}>
                        <AccountLabel account={account} />
                        {supported ? (
                          <input
                            type="checkbox"
                            checked={!deselected.includes(account.accountId)}
                            onChange={(event) =>
                              setDeselected((current) =>
                                event.target.checked
                                  ? current.filter((id) => id !== account.accountId)
                                  : [...current, account.accountId],
                              )
                            }
                            data-testid={`delete-account-checkbox-${account.accountId}`}
                            className="size-4 accent-[rgb(var(--primary))]"
                          />
                        ) : (
                          <span className="text-right text-xs text-[var(--text-muted)]">
                            {account.platform ? PLATFORM_LABELS[account.platform] : 'This platform'} doesn't allow deleting via the API
                          </span>
                        )}
                      </label>
                    </li>
                  );
                })}
              </ul>
              {keptLive.length > 0 && (
                <p className="text-xs text-[var(--text-muted)]" data-testid="delete-post-kept-live-note">
                  The post stays live on{' '}
                  {keptLive.map((account) => (account.platform ? PLATFORM_LABELS[account.platform] : 'unknown')).join(', ')}.
                </p>
              )}
            </div>
          )}

          {outcome && (
            <div role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300" data-testid="delete-post-outcome">
              <p>{outcome.message}</p>
              {outcome.results.length > 0 && (
                <ul className="mt-1 space-y-0.5 text-xs">
                  {outcome.results.map((item) => (
                    <li key={item.accountId}>
                      {PLATFORM_LABELS[item.platform] ?? item.platform}: {RESULT_TEXT[item.status] ?? item.status}
                      {item.message ? ` — ${item.message}` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
