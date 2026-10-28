import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";

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
import { socialPlatforms, Status } from "../constant/content";
import { useCreatePost } from "../hooks/useCreatePost";
import { createPostSchema, type CreatePostType } from "../types";
import { useCallback, useState } from "react";
import type { PostMedia } from "../types/content";

export function CreatePostPage() {
  const navigate = useNavigate();
  const [media, setMedia] = useState<PostMedia | null>(null);
  const { isSubmitting, OnSave } = useCreatePost();

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
      platforms: [],
      scheduledAt: "",
      hashtags: "",
      status: Status.DRAFT,
      mediaUrls: [],
    },
  });

  const scheduledAt = watch("scheduledAt");
const onSubmit = useCallback(
  handleSubmit(async (values) => {
    const updatedValues = {
      ...values,
      status: scheduledAt ? Status.SCHEDULED : Status.DRAFT as any
    };

    await OnSave(updatedValues, media);
  }),
  [handleSubmit, scheduledAt, OnSave, media,],
);

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        title="Create a post"
        description="Create content and choose where and when to publish it."
      />

      <form onSubmit={onSubmit} noValidate>
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
                    variant="secondary"
                    onClick={() => navigate("/content")}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>

                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? "Saving…"
                      : status === Status.DRAFT
                        ? "Save draft"
                        : "Schedule post"}
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
                    <p>Platforms</p>

                    <Controller
                      name="platforms"
                      control={control}
                      render={({ field }) => (
                        <select
                          value={field.value[0] ?? ""}
                          onChange={(event) => {
                            const value = event.target
                              .value as CreatePostType["platforms"][number];
                            field.onChange(value ? [value] : []);
                          }}
                          className={`${inputClass} mt-1.5 font-normal`}
                        >
                          <option value="">Select a platform</option>
                          {socialPlatforms.map((platform) => (
                            <option key={platform} value={platform}>
                              {platform}
                            </option>
                          ))}
                        </select>
                      )}
                    />

                    {errors.platforms && (
                      <span
                        role="alert"
                        className="mt-1 block text-sm text-red-600"
                      >
                        {errors.platforms.message}
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
                    {errors.scheduledAt && (
                      <span
                        role="alert"
                        className="mt-1 block text-sm text-red-600"
                      >
                        {errors.scheduledAt.message}
                      </span>
                    )}
                  </label>
                </CardContent>
              </Card>
            </div>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
