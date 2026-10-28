export enum Platform {
  Instagram = "Instagram",
  LinkedIn = "LinkedIn",
  TikTok = "TikTok",
  X = "X",
  Facebook = "Facebook",
  YouTube = "YouTube",
}

export const socialPltforms = [
    Platform.Facebook,
    Platform.Instagram,
    Platform.LinkedIn,
    Platform.X
]
export enum Status {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED",
}

const SUPPORTED_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/webm',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024;
  