export const SOCIAL_PLATFORMS = {
    FACEBOOK: "facebook",
    INSTAGRAM: "instagram",
    TWITTER: "twitter",
    YOUTUBE: "youtube",
    THREADS: "threads",
    LINKEDIN: "linkedin",
} as const;

export type SocialPlatform =
    (typeof SOCIAL_PLATFORMS)[keyof typeof SOCIAL_PLATFORMS];

export const SOCIAL_PLATFORM_LIST = Object.values(SOCIAL_PLATFORMS);

// UI display labels — kept separate from internal identifiers.
export const PLATFORM_LABELS: Record<SocialPlatform, string> = {
    [SOCIAL_PLATFORMS.FACEBOOK]: "Facebook",
    [SOCIAL_PLATFORMS.INSTAGRAM]: "Instagram",
    [SOCIAL_PLATFORMS.TWITTER]: "Twitter",
    [SOCIAL_PLATFORMS.YOUTUBE]: "YouTube",
    [SOCIAL_PLATFORMS.THREADS]: "Threads",
    [SOCIAL_PLATFORMS.LINKEDIN]: "LinkedIn",
};
