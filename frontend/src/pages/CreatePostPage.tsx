import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
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
import { MediaPicker } from "../components/post/MediaPicker";
import { AccountSelector } from "../components/post/AccountSelector";
import { Status } from "../constant/content";
import { useConnectedAccounts } from "../hooks/useSocialAccounts";
import { useCreatePost } from "../hooks/useCreatePost";
import { createPostSchema, type CreatePostType } from "../types";
import { useCallback, useState } from "react";
import type { PostMedia } from "../types/content";

type PublishIntent =
  | typeof Status.DRAFT
  | typeof Status.SCHEDULED
  | typeof Status.PUBLISHED;

export function CreatePostPage() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<PostMedia | null>(null);
  const { isSubmitting, OnSave } = useCreatePost();
  const accounts = useConnectedAccounts();

  const {
    control,
    handleSubmit,
    watch,
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

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        title="Create a post"
        description="Create content and choose where and when to publish it."
      />

      <form onSubmit={submitWith(Status.DRAFT)} noValidate>
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

                <div>
                  <p className={`${labelClass} mb-2`}>Media</p>

                  <MediaPicker media={media} onChange={setMedia} />

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
                      Needed only when you schedule the post.
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
