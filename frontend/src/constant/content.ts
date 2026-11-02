import type { PostStatus } from "../types";

export enum Platform {
  Instagram = "Instagram",
  linkedin = "linkedin",
  TikTok = "TikTok",
  X = "X",
  facebook = "facebook",
  Youtube = "Youtube",
}

export const socialPlatforms = [
  Platform.facebook,
  Platform.Instagram,
  Platform.linkedin,
  Platform.X,
  Platform.TikTok,
] as const;
export enum Status {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  NEEDS_REVIEW = "NEEDS_REVIEW",
  FAILED = "FAILED",
}

// const SUPPORTED_TYPES = new Set([
//   'image/jpeg',
//   'image/png',
//   'image/webp',
//   'video/mp4',
//   'video/webm',
// ]);
// const MAX_FILE_SIZE = 5 * 1024 * 1024;


export type ContentStatus = 'DRAFT' | 'SCHEDULED' | 'PUBLISHED' | 'FAILED';
export type ContentType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'CAROUSEL';

export type ContentRecord = {
  id: string;
  title: string | null;
  caption: string;
  platforms: string[] | null;
  contentType: ContentType;
  mediaUrls: string[] | null;
  hashtags: string[] | null;
  status: ContentStatus;
  scheduledAt: string | null;
  createdAt: string | null;
};

export type ContentListData = {
  getContents: {
    success: boolean;
    message: string;
    total: number;
    contents: ContentRecord[];
  };
};

export const DISPLAY_STATUS: Record<ContentStatus, PostStatus> = {
  DRAFT: 'Draft',
  SCHEDULED: 'Scheduled',
  PUBLISHED: 'Published',
  FAILED: 'Failed',
};


export const statusColors: Record<string, string> = {
  PUBLISHED: 'rgb(var(--success))',
  SCHEDULED: 'rgb(var(--info))',
  DRAFT: 'var(--text-muted)',
  NEEDS_REVIEW: 'rgb(var(--warning))',
  FAILED: 'rgb(var(--error))',
};

export const platformColors: Record<string, string> = {
  INSTAGRAM: '#E1306C',
  FACEBOOK: '#1877F2',
  LINKEDIN: '#0A66C2',
  TWITTER: '#1DA1F2',
  X: '#000000',
  YOUTUBE: '#FF0000',
  TIKTOK: '#111111',
};
export 
const normalizeValue = (value: string) =>
  value.toUpperCase().replace(/[\s-]/g, '_');
