
import { useCallback } from 'react';
import axios from 'axios';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { graphqlRequest } from '../lib/graphqlClient';
import { type CreatePostType } from '../types';
import type { PostMedia } from '../types/content';
import { CREATE_CONTENT, CREATE_UPLOAD_URL } from '../queries/content';
import { Status } from '../constant/content.js';

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
  };
};

type SavePostVariables = {
  values: CreatePostType;
  media: PostMedia | null;
};

export function useCreatePost() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ values, media }: SavePostVariables) => {
      const file = media?.file;
      const uploadedKeys: string[] = [];

      // 1. Upload media to S3 if a file is selected.
      if (file) {
        const data = await graphqlRequest<UploadData>(CREATE_UPLOAD_URL, {
          input: {
            contentType: file.type,
            fileSize: file.size,
          },
        });

        const { uploadUrl, key } = data.createUploadUrl;
        console.log(file,"=>file")
        await axios.put(uploadUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
        });

        uploadedKeys.push(key);
      }

      // 2. Create the post after the media upload succeeds.
      const input = {
        caption: values.caption,
        contentType: file
          ? media?.kind === 'image'
            ? 'IMAGE'
            : 'VIDEO'
          : 'TEXT',
        status: values.status.toUpperCase(),
        ...(values.status === Status.SCHEDULED && values.scheduledAt
          ? {
              scheduledAt: new Date(values.scheduledAt).toISOString(),
            }
          : {}),
        mediaUrls: uploadedKeys,
        hashtags: values.hashtags
          ?.split(/[\s,]+/)
          .map((tag) => tag.trim())
          .filter(Boolean)
          .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`)),
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

    onSuccess: async (_data, { values }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
        queryClient.invalidateQueries({ queryKey: ['posts'] }),
      ]);

      toast.success(
        values.status === Status.SCHEDULED
          ? 'Post scheduled'
          : 'Draft saved',
      );

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
