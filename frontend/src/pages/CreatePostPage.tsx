import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { CalendarClock, Save, Send } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { inputClass, labelClass } from "../components/ui/Input";
import { PageHeading } from "../components/layout/AppLayout";
import { CaptionEditor } from "../components/post/CaptionEditor";
import { MediaPicker, MediaPreview } from "../components/post/MediaPicker";
import { PostAccountsList } from "../components/post/PostAccountsList";
import { AccountSelector } from "../components/post/AccountSelector";
import {
  EDITABLE_PLATFORMS,
  Status,
  parseContentDate,
} from "../constant/content";
import { PLATFORM_LABELS } from "../constant/socialPlatforms";
import { usePost, usePostAccounts } from "../hooks/usePost";
import { useConnectedAccounts } from "../hooks/useSocialAccounts";
import { useCreatePost, useUpdatePost } from "../hooks/useCreatePost";
import { createPostSchema, type CreatePostType } from "../types";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PostMedia } from "../types/content";

// Value for a datetime-local input, in the user's local time.
const toLocalInput = (value: string | null | undefined) => {
  const date = parseContentDate(value);
  if (!date) return "";
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
};

type PublishIntent =
  | typeof Status.DRAFT
  | typeof Status.SCHEDULED
  | typeof Status.PUBLISHED;

export function CreatePostPage() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<PostMedia | null>(null);
  const { isSubmitting: isCreating, OnSave } = useCreatePost();
  const accounts = useConnectedAccounts();

  // Edit mode (/content/:id/edit) reuses this form for an existing post.
  const { id: editId } = useParams();
  const isEdit = Boolean(editId);
  const existing = usePost(editId);
  const post = existing.data;
  const postAccounts = usePostAccounts(post);
  const { isSubmitting: isUpdating, OnUpdate } = useUpdatePost(editId);
  const isSubmitting = isCreating || isUpdating;
  const isPublished = post?.status === Status.PUBLISHED;
  const isScheduled = post?.status === Status.SCHEDULED;
  const isPublishing = post?.status === Status.PUBLISHING;
  const loadedId = useRef<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreatePostType>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: "",
      caption: "",
      accountIds: [],
      scheduledAt: "",
      hashtags: "",
      status: Status.DRAFT,
      mediaUrls: [],
    },
  });

  // Fill the form once per post, so a background refetch never overwrites edits.
  useEffect(() => {
    if (!post || loadedId.current === post.id) return;
    loadedId.current = post.id;
    reset({
      title: post.title ?? "",
      caption: post.caption,
      accountIds: post.accountIds ?? [],
      scheduledAt: toLocalInput(post.scheduledAt),
      hashtags: (post.hashtags ?? []).join(" "),
      status: Status.DRAFT,
      mediaUrls: [],
    });
    const key = post.mediaUrls?.[0];
    setMedia(
      key
        ? {
            kind: post.contentType === "VIDEO" ? "video" : "image",
            url: post.mediaPreviewUrls?.[0] ?? null,
            name: key.split("/").pop() ?? "Attachment",
            key,
          }
        : null,
    );
  }, [post, reset]);

  const saveEdit = handleSubmit(async (values) => {
    if (
      isScheduled &&
      (!values.scheduledAt ||
        new Date(values.scheduledAt).getTime() <= Date.now())
    ) {
      toast.error("Choose a date and time in the future.");
      return;
    }

    await OnUpdate(
      { ...values, scheduledAt: isScheduled ? values.scheduledAt : "" },
      media,
    );
  });

  const scheduledAt = watch("scheduledAt");
  const selectedAccountIds = watch("accountIds");
  const connectedAccounts = accounts.data ?? [];
  const hasConnectedAccounts = connectedAccounts.length > 0;

  // Publishing and scheduling both require at least one connected account;
  // a draft can be saved without one.
  const submitWith = useCallback(
    (intent: PublishIntent) =>
      handleSubmit(async (values) => {
        if (intent !== Status.DRAFT) {
          if (values.accountIds.length === 0) {
            toast.error("Select at least one connected account.");
            return;
          }

          if (
            intent === Status.SCHEDULED &&
            (!values.scheduledAt ||
              new Date(values.scheduledAt).getTime() <= Date.now())
          ) {
            toast.error("Choose a date and time in the future.");
            return;
          }
        }

        await OnSave({ ...values, status: intent }, media);
      }),
    [handleSubmit, OnSave, media],
  );

  const disableActions = isSubmitting || accounts.isPending;
  const disablePublishing = disableActions || !hasConnectedAccounts;

  if (isEdit && !post) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeading title="Edit post" />
        {existing.isError ? (
          <div role="alert" className="text-sm text-red-600">
            {existing.error instanceof Error
              ? existing.error.message
              : "Could not load the post."}
            <Button
              variant="secondary"
              className="ml-3"
              onClick={() => navigate("/content")}
            >
              Back to content
            </Button>
          </div>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">Loading post…</p>
        )}
      </div>
    );
  }

  // Platforms where a published caption edit can be pushed through Zernio.
  const publishedPlatforms = [
    ...new Set(
      postAccounts
        .filter((account) => account.result?.status === "published")
        .map((account) => account.platform)
        .filter((platform) => platform !== null),
    ),
  ];
  const editable = publishedPlatforms.filter((platform) =>
    EDITABLE_PLATFORMS.includes(platform),
  );
  const notEditable = publishedPlatforms.filter(
    (platform) => !EDITABLE_PLATFORMS.includes(platform),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        title={isEdit ? "Edit post" : "Create a post"}
        description={
          isEdit
            ? "Update this post. Scheduled posts are updated with Zernio before they go out."
            : "Create content and choose where and when to publish it."
        }
      />

      <form onSubmit={isEdit ? saveEdit : submitWith(Status.DRAFT)} noValidate>
        <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
            <Card>
              <CardHeader>
                <CardTitle title="Post content" />
              </CardHeader>

              <CardContent className="space-y-4 pt-3">
                <label className={labelClass}>
                  Title
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        required
                        maxLength={30}
                        placeholder="A short title for your post"
                        data-testid="post-title-input"
                        className={`${inputClass} mt-1.5 font-normal`}
                      />
                    )}
                  />
                  {errors.title && (
                    <span
                      role="alert"
                      className="mt-1 block text-sm text-red-600"
                    >
                      {errors.title.message}
                    </span>
                  )}
                </label>

                <div>
                  <Controller
                    name="caption"
                    control={control}
                    render={({ field }) => (
                      <CaptionEditor
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />

                  {errors.caption && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors.caption.message}
                    </p>
                  )}
                </div>

                <label className={labelClass}>
                  Hashtags
                  <Controller
                    name="hashtags"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        value={field.value ?? ""}
                        placeholder="#ProductLaunch, SocialMedia"
                        aria-describedby="hashtags-help"
                        data-testid="post-hashtags-input"
                        className={`${inputClass} mt-1.5 font-normal`}
                      />
                    )}
                  />
                  <span
                    id="hashtags-help"
                    className="mt-1 block text-xs font-normal text-[var(--text-muted)]"
                  >
                    Separate hashtags with spaces or commas. The # is optional.
                  </span>
                  {errors.hashtags && (
                    <span
                      role="alert"
                      className="mt-1 block text-sm text-red-600"
                    >
                      {errors.hashtags.message}
                    </span>
                  )}
                </label>

                {isPublished && (
                  <p
                    className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]"
                    data-testid="published-edit-note"
                  >
                    This post is already published. Caption changes are pushed to{" "}
                    {editable.length
                      ? editable.map((platform) => PLATFORM_LABELS[platform]).join(", ")
                      : "no platform"}
                    {notEditable.length
                      ? `; ${notEditable.map((platform) => PLATFORM_LABELS[platform]).join(", ")} ${notEditable.length === 1 ? "doesn't" : "don't"} allow editing published posts`
                      : ""}
                    . Media and the publish time can't be changed after publishing.
                  </p>
                )}

                {isPublishing && (
                  <p role="alert" className="rounded-lg bg-[var(--surface-muted)] px-3 py-2 text-xs text-[var(--text-muted)]">
                    This post is being published right now. You can edit it once publishing finishes.
                  </p>
                )}

                <div>
                  <p className={`${labelClass} mb-2`}>Media</p>

                  {isPublished ? (
                    media ? (
                      <MediaPreview media={media} className="max-h-64" />
                    ) : (
                      <p className="text-sm text-[var(--text-muted)]">No media.</p>
                    )
                  ) : (
                    <MediaPicker media={media} onChange={setMedia} />
                  )}

                  {errors?.mediaUrls && (
                    <p role="alert" className="mt-1 text-sm text-red-600">
                      {errors?.mediaUrls?.message}
                    </p>
                  )}
                </div>

                {Object.keys(errors).length > 0 && (
                  <p
                    role="alert"
                    className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
                  >
                    Please correct the validation errors above.
                  </p>
                )}

                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => navigate("/content")}
                    disabled={isSubmitting}
                    data-testid="cancel-post-button"
                  >
                    Cancel
                  </Button>

                  {isEdit ? (
                    <Button
                      type="submit"
                      disabled={isSubmitting || isPublishing}
                      data-testid="save-post-changes-button"
                    >
                      <Save size={15} />
                      {isUpdating ? "Saving…" : "Save changes"}
                    </Button>
                  ) : (
                  <>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={submitWith(Status.DRAFT)}
                    disabled={disableActions}
                    data-testid="save-draft-button"
                  >
                    <Save size={15} />
                    {isSubmitting ? "Saving…" : "Save draft"}
                  </Button>

                  <Button
                    type="button"
                    variant="secondary"
                    onClick={submitWith(Status.SCHEDULED)}
                    disabled={disablePublishing || !scheduledAt}
                    data-testid="schedule-post-button"
                  >
                    <CalendarClock size={15} />
                    Schedule
                  </Button>

                  <Button
                    type="button"
                    onClick={submitWith(Status.PUBLISHED)}
                    disabled={disablePublishing}
                    data-testid="publish-now-button"
                  >
                    <Send size={15} />
                    Publish now
                  </Button>
                  </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle title="Publish settings" />
                </CardHeader>

                <CardContent className="space-y-4 pt-3">
                  <div className={labelClass}>
                    <p>Accounts</p>
                    {isEdit ? (
                      <>
                        <span className="mb-2 block text-xs font-normal text-[var(--text-muted)]">
                          The accounts can't be changed after a post is created.
                        </span>
                        <PostAccountsList accounts={postAccounts} />
                      </>
                    ) : (
                    <>
                    <span className="block text-xs font-normal text-[var(--text-muted)]">
                      Select one or more connected accounts. The same post goes
                      to every account you pick.
                    </span>

                    <Controller
                      name="accountIds"
                      control={control}
                      render={({ field }) => (
                        <AccountSelector
                          accounts={connectedAccounts}
                          selected={field.value}
                          onChange={field.onChange}
                          isLoading={accounts.isPending}
                          isError={accounts.isError}
                          errorMessage={
                            accounts.error instanceof Error
                              ? accounts.error.message
                              : undefined
                          }
                          onRetry={() => void accounts.refetch()}
                        />
                      )}
                    />

                    {errors.accountIds && (
                      <span
                        role="alert"
                        className="mt-1 block text-sm text-red-600"
                      >
                        {errors.accountIds.message}
                      </span>
                    )}
                    </>
                    )}
                  </div>

                  <label className={labelClass}>
                    Date and time
                    <Controller
                      name="scheduledAt"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="datetime-local"
                          data-testid="scheduled-at-input"
                          disabled={isEdit && !isScheduled}
                          min={new Date(
                            Date.now() -
                              new Date().getTimezoneOffset() * 60_000,
                          )
                            .toISOString()
                            .slice(0, 16)}
                          className={`${inputClass} mt-1.5 font-normal`}
                        />
                      )}
                    />
                    <span className="mt-1 block text-xs font-normal text-[var(--text-muted)]">
                      {isEdit && !isScheduled
                        ? "Only a scheduled post's publish time can be changed."
                        : isEdit
                          ? "Changing it reschedules the post with Zernio."
                          : "Needed only when you schedule the post."}
                    </span>
                    {errors.scheduledAt && (
                      <span
                        role="alert"
                        className="mt-1 block text-sm text-red-600"
                      >
                        {errors.scheduledAt.message}
                      </span>
                    )}
                  </label>

                  <p
                    className="text-xs font-normal text-[var(--text-muted)]"
                    data-testid="selected-accounts-count"
                    hidden={isEdit}
                  >
                    {selectedAccountIds.length} account
                    {selectedAccountIds.length === 1 ? "" : "s"} selected
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
