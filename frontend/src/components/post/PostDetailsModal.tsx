import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { MediaPreview } from './MediaPicker';
import { PostAccountsList } from './PostAccountsList';
import { usePost, usePostAccounts } from '../../hooks/usePost';
import { DISPLAY_STATUS, formatContentDate } from '../../constant/content';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <p className="text-xs font-medium uppercase text-[var(--text-muted)]">{label}</p>
    <div className="mt-1 text-sm text-[var(--text)]">{children}</div>
  </div>
);

export function PostDetailsModal({
  postId,
  onClose,
  onEdit,
  onDelete,
}: {
  postId: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const { data: post, isLoading, isError, error } = usePost(postId ?? undefined);
  const accounts = usePostAccounts(post);
  const previews = post?.mediaPreviewUrls ?? [];
  const kind = post?.contentType === 'VIDEO' ? 'video' : 'image';

  return (
    <Modal
      open={Boolean(postId)}
      onOpenChange={(open) => !open && onClose()}
      title={post?.title?.trim() || 'Post details'}
      testId="post-details-modal"
      className="max-w-2xl"
      footer={
        post && (
          <>
            <Button variant="secondary" onClick={() => onDelete(post.id)} data-testid="post-details-delete-button">
              <Trash2 size={15} /> Delete
            </Button>
            <Button onClick={() => onEdit(post.id)} data-testid="post-details-edit-button">
              <Pencil size={15} /> Edit
            </Button>
          </>
        )
      }
    >
      {isLoading && (
        <p className="flex items-center gap-2 py-6 text-sm text-[var(--text-muted)]">
          <Loader2 size={15} className="animate-spin" /> Loading post…
        </p>
      )}

      {isError && (
        <p role="alert" className="py-6 text-sm text-red-600">
          {error instanceof Error ? error.message : 'Could not load the post.'}
        </p>
      )}

      {post && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <Field label="Status">
              <span data-testid="post-details-status">
                <StatusBadge status={DISPLAY_STATUS[post.status]} className="text-sm text-[var(--text)]" />
              </span>
            </Field>
            {post.scheduledAt && (
              <Field label="Scheduled for">
                <span data-testid="post-details-scheduled-at">{formatContentDate(post.scheduledAt)}</span>
              </Field>
            )}
            {post.publishedAt && (
              <Field label="Published">
                <span data-testid="post-details-published-at">{formatContentDate(post.publishedAt)}</span>
              </Field>
            )}
            <Field label="Type">{post.contentType}</Field>
          </div>

          {post.statusReason && (
            <p className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]" data-testid="post-details-status-reason">
              {post.statusReason}
            </p>
          )}

          <Field label="Caption">
            <p className="whitespace-pre-wrap break-words" data-testid="post-details-caption">{post.caption}</p>
            {post.hashtags?.length ? <p className="mt-1 text-xs text-primary">{post.hashtags.join(' ')}</p> : null}
          </Field>

          {post.mediaUrls?.length ? (
            <Field label="Media">
              {previews.length ? (
                <div className="grid gap-2" data-testid="post-details-media">
                  {previews.map((url, index) => (
                    <MediaPreview key={url} media={{ kind, url, name: `Attachment ${index + 1}` }} className="max-h-72" />
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)]">
                  {post.mediaUrls.length} attachment{post.mediaUrls.length === 1 ? '' : 's'} (preview unavailable)
                </p>
              )}
            </Field>
          ) : null}

          <Field label="Platforms and accounts">
            <PostAccountsList accounts={accounts} />
          </Field>
        </div>
      )}
    </Modal>
  );
}
