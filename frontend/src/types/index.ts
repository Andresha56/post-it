import { z } from 'zod';

export const postStatusSchema = z.enum(['Published', 'Scheduled', 'Draft', 'Needs Review', 'Failed']);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const socialPlatformSchema = z.enum(['Instagram', 'LinkedIn', 'X', 'TikTok', 'YouTube']);
export type SocialPlatform = z.infer<typeof socialPlatformSchema>;

export const postSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  platform: socialPlatformSchema,
  status: postStatusSchema,
  scheduledAt: z.string().datetime().optional(),
  publishedAt: z.string().datetime().optional(),
  imageUrl: z.string().url().optional(),
  views: z.number().nonnegative().default(0),
  likes: z.number().nonnegative().default(0),
  comments: z.number().nonnegative().default(0)
});
export type Post = z.infer<typeof postSchema>;

export const dashboardSchema = z.object({
  metrics: z.array(z.object({
    id: z.string(), label: z.string(), value: z.string(), change: z.string(), trend: z.enum(['up', 'down']),
    icon: z.enum(['users', 'reach', 'heart', 'send'])
  })),
  posts: z.array(postSchema)
});
export type DashboardData = z.infer<typeof dashboardSchema>;

export const createPostSchema = z.object({
  title: z.string().trim().min(3, 'Add a little more detail to your post.').max(500),
  platform: socialPlatformSchema,
  status: z.enum(['Draft', 'Scheduled']),
  scheduledAt: z.string().optional()
});
export type CreatePostInput = z.infer<typeof createPostSchema>;
