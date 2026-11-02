
import { useCallback } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { graphqlRequest } from '../lib/graphqlClient';
import { type CreatePostType } from '../types';
import type { PostMedia } from '../types/content';
import { CREATE_CONTENT, CREATE_UPLOAD_URL, UPDATE_CONTENT } from '../queries/content';
import { Status, type ContentMutationResult, type ContentStatus } from '../constant/content.js';

type UploadData = {
  createUploadUrl: {
    uploadUrl: string;
    key: string;
  };
};

type CreateData = {
  createContent: {
    success: boolean;
    message: string;
    content: {
      id: string;
      status: ContentStatus;
      statusReason: string | null;
    } | null;
  };
};

// Upload a file to S3 through a presigned URL and return its object key.
async function uploadMediaFile(file: File) {
  const data = await graphqlRequest<UploadData>(CREATE_UPLOAD_URL, {
    input: {
      contentType: file.type,
      fileSize: file.size,
    },
  });

  const { uploadUrl, key } = data.createUploadUrl;

  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type,
    },
  });

  return key;
}

const parseHashtags = (value?: string) =>
  value
    ?.split(/[\s,]+/)
    .map((tag) => tag.trim())
    .filter(Boolean)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`));

type SavePostVariables = {
  values: CreatePostType;
  media: PostMedia | null;
};

// The status the backend reports is what actually happened at Zernio, so the
// confirmation is based on it rather than on what was requested.
const RESULT_MESSAGE: Record<ContentStatus, string> = {
  DRAFT: 'Draft saved',
  SCHEDULED: 'Post scheduled',
  PUBLISHING: 'Publishing started — we will update the status shortly',
  PUBLISHED: 'Post published',
  FAILED: 'Publishing failed',
  CANCELLED: 'Post cancelled',
};

export function useCreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ values, media }: SavePostVariables) => {
      const file = media?.file;
      const uploadedKeys: string[] = [];

      // 1. Upload media to S3 if a file is selected. A failure here rejects
      //    before the post is created, so nothing is published without it.
      if (file) {
        uploadedKeys.push(await uploadMediaFile(file));
      }

      // 2. Create the post after the media upload succeeds. Platforms are
      //    derived from the selected account IDs on the server.
      const input = {
        title: values.title,
        accountIds: values.accountIds,
        caption: values.caption,
        contentType: file
          ? media?.kind === 'image'
            ? 'IMAGE'
            : 'VIDEO'
          : 'TEXT',
        status: values.status,
        ...(values.status === Status.SCHEDULED && values.scheduledAt
          ? {
              scheduledAt: new Date(values.scheduledAt).toISOString(),
            }
          : {}),
        mediaUrls: uploadedKeys,
        hashtags: parseHashtags(values.hashtags),
      };
      const result = await graphqlRequest<CreateData>(CREATE_CONTENT, {
        input,
      });

      if (!result.createContent.success) {
        throw new Error(
          result.createContent.message || 'Post was not saved.',
        );
      }

      return result.createContent;
    },

    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
      ]);

      const status = data.content?.status ?? Status.DRAFT;

      if (status === Status.FAILED) {
        toast.error(data.content?.statusReason || RESULT_MESSAGE.FAILED);
      } else {
        toast.success(RESULT_MESSAGE[status]);

        if (data.content?.statusReason) {
          toast(data.content.statusReason);
        }
      }

      navigate('/content');
    },

    onError: (err) => {
      const message =
        err instanceof Error ? err.message : 'Could not save post.';

      toast.error(message);
    },
  });

  const OnSave = useCallback(
    async (values: CreatePostType, media: PostMedia | null) => {
      try {
        await mutation.mutateAsync({ values, media });
      } catch {
        // The onError callback handles the error toast.
      }
    },
    [mutation.mutateAsync],
  );

  return {
    error: mutation.error instanceof Error ? mutation.error.message : '',
    isSubmitting: mutation.isPending,
    OnSave,
  };
}

/**
 * Saves an edited post. New media goes through the same S3 upload as creation;
 * unchanged media keeps its stored key, and removed media sends no keys.
 * Success is only reported when the backend confirms it (for scheduled and
 * published posts that means Zernio accepted the change).
 */
export function useUpdatePost(id: string | undefined) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ values, media }: SavePostVariables) => {
      if (!id) throw new Error('No post selected.');

      const mediaKeys = media?.file
        ? [await uploadMediaFile(media.file)]
        : media?.key
          ? [media.key]
          : [];

      const input = {
        title: values.title,
        caption: values.caption,
        contentType: mediaKeys.length
          ? media?.kind === 'video'
            ? 'VIDEO'
            : 'IMAGE'
          : 'TEXT',
        mediaUrls: mediaKeys,
        hashtags: parseHashtags(values.hashtags) ?? [],
        ...(values.scheduledAt
          ? { scheduledAt: new Date(values.scheduledAt).toISOString() }
          : {}),
      };

      const result = (
        await graphqlRequest<{ updateContent: ContentMutationResult }>(UPDATE_CONTENT, { id, input })
      ).updateContent;

      if (!result.success) throw new Error(result.message || 'Post was not updated.');

      return result;
    },

    onSuccess: (data) => {
      const notApplied = (data.results ?? []).some((result) =>
        ['failed', 'unsupported'].includes(result.status),
      );

      if (notApplied) {
        toast(data.message, { duration: 7000 });
      } else {
        toast.success(data.message || 'Post updated');
      }

      navigate('/content');
    },

    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'Could not update post.');
    },

    // Refresh even after a failure: a partial outcome may have changed the stored post.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
        queryClient.invalidateQueries({ queryKey: ['post', id] }),
      ]),
  });

  const OnUpdate = useCallback(
    async (values: CreatePostType, media: PostMedia | null) => {
      try {
        await mutation.mutateAsync({ values, media });
      } catch {
        // The onError callback handles the error toast.
      }
    },
    [mutation.mutateAsync],
  );

  return { isSubmitting: mutation.isPending, OnUpdate };
}
