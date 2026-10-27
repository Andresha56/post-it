import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { mockApi } from "../lib/mockApi";
import { createPostSchema, type SocialPlatform } from "../types";
import { Button } from "../components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import { inputClass, textareaClass, labelClass } from "../components/ui/Input";
import { PageHeading } from "../components/layout/AppLayout";
import { CaptionEditor } from "../components/post/CaptionEditor";
import { MediaPicker, MediaPreview, type PostMedia } from "../components/post/MediaPicker";

const platforms: SocialPlatform[] = [
  "Instagram",
  "LinkedIn",
  "X",
  "Facebook",
  "YouTube",

];

export function CreatePostPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform>("Instagram");
  const [scheduledAt, setScheduledAt] = useState("");
  const [media, setMedia] = useState<PostMedia | null>(null);
  const [error, setError] = useState("");
  const status = scheduledAt ? "Scheduled" : "Draft";
  const mutation = useMutation({
    mutationFn: mockApi.createPost,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      await queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post saved");
      navigate("/content");
    },
    onError: () => toast.error("Could not save post. Try again."),
  });
  const submit = () => {
    const parsed = createPostSchema.safeParse({
      title,
      platform,
      status,
      scheduledAt: status === "Scheduled" ? scheduledAt : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Check your post details.");
      return;
    }
    if (status === "Scheduled" && !scheduledAt) {
      setError("Choose a date and time to schedule this post.");
      return;
    }
    setError("");
    mutation.mutate(parsed.data);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeading
        title="Create a post"
        description="Create content and choose where and when to publish it."
      />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)]">
        <Card>
          <CardHeader>
            <CardTitle title="Post content" />
          </CardHeader>
          <CardContent className="space-y-4 pt-3">
            <CaptionEditor value={title} onChange={setTitle} />
            <div>
              <p className={`${labelClass} mb-2`}>Media</p>
              <MediaPicker media={media} onChange={setMedia} />
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300"
              >
                {error}
              </p>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={() => navigate("/content")}>
                Cancel
              </Button>
              <Button onClick={submit} disabled={mutation.isPending}>
                {mutation.isPending
                  ? "Saving…"
                  : status === "Draft"
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
              <label className={labelClass}>
                Platform
                <select
                  value={platform}
                  onChange={(event) =>
                    setPlatform(event.target.value as SocialPlatform)
                  }
                  className={`${inputClass} mt-1.5 font-normal`}
                >
                  {platforms.map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
              </label>
              
                <label className={labelClass}>
                  Date and time
                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(event) => setScheduledAt(event.target.value)}
                    min={new Date().toISOString().slice(0, 16)}
                    className={`${inputClass} mt-1.5 font-normal`}
                  />
                </label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle title="Preview" />
            </CardHeader>
            <CardContent className="pt-3">
              <div className="rounded-lg border border-[var(--border)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="grid size-7 place-items-center rounded-full bg-[var(--surface-muted)] text-xs font-medium text-[var(--text)]">
                    P
                  </span>
                  <div>
                    <p className="text-[13px] font-medium leading-4 text-[var(--text)]">
                      Orbit Workspace
                    </p>
                    <p className="text-xs leading-4 text-[var(--text-muted)]">
                      {platform}
                    </p>
                  </div>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm text-[var(--text)]">
                  {title || "Your caption preview will appear here."}
                </p>
                {media && <MediaPreview media={media} className="mt-3 max-h-56" />}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
