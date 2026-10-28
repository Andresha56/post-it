import { z } from "zod";
import { Status } from "../constant/content.js";

// const hashtagPattern = /^#[\p{L}\p{N}_]+$/u;
export const postStatusSchema = z.enum([
  "Published",
  "Scheduled",
  "Draft",
  "Needs Review",
  "Failed",
]);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const socialPlatformSchema = z.enum([
  "Instagram",
  "LinkedIn",
  "X",
  "Facebook",
  "YouTube",
]);
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
  comments: z.number().nonnegative().default(0),
});
export type Post = z.infer<typeof postSchema>;

export const dashboardSchema = z.object({
  metrics: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      value: z.string(),
      change: z.string(),
      trend: z.enum(["up", "down"]),
      icon: z.enum(["users", "reach", "heart", "send"]),
    }),
  ),
  posts: z.array(postSchema),
});
export type DashboardData = z.infer<typeof dashboardSchema>;

export const createPostSchema = z.object({
  caption: z
    .string()
    .trim()
    .min(3, "Please enter at least 3 characters.")
    .max(500, "Caption cannot exceed 500 characters."),

  platform: socialPlatformSchema,

  status: z.enum([
    Status.DRAFT,
    Status.PUBLISHED,
    Status.SCHEDULED,
  ]),

  scheduledAt: z.string().optional(),
  mediaUrls: z.array(z.string()).default([]).optional(),
  hashtags: z.string().max(2000, 'Hashtag input is too long.').optional(),
});


export type CreatePostType = z.infer<typeof createPostSchema>;

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});
export type SignInInput = z.infer<typeof signInSchema>;

export const signUpSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name.")
    .max(80, "Keep your name under 80 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  password: z
    .string()
    .min(8, "Use at least 8 characters.")
    .max(128, "Use 128 characters or fewer."),
});
export type SignUpInput = z.infer<typeof signUpSchema>;

export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Enter your email address.")
    .email("Enter a valid email address."),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code from your email."),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
