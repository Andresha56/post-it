/**
 * Centralized social platform identifiers (lowercase everywhere).
 * Must stay in sync with frontend/src/constant/socialPlatforms.ts.
 */
const SOCIAL_PLATFORMS = Object.freeze({
    FACEBOOK: "facebook",
    INSTAGRAM: "instagram",
    TWITTER: "twitter",
    YOUTUBE: "youtube",
    THREADS: "threads",
    LINKEDIN: "linkedin",
});

const SUPPORTED_PLATFORMS = Object.values(SOCIAL_PLATFORMS);

// Platforms on which Zernio can change the text of an already published post
// (POST /v1/posts/{id}/edit). Media can never be edited after publishing.
const EDITABLE_PLATFORMS = Object.freeze([
    SOCIAL_PLATFORMS.TWITTER,
    SOCIAL_PLATFORMS.FACEBOOK,
    SOCIAL_PLATFORMS.LINKEDIN,
    SOCIAL_PLATFORMS.YOUTUBE,
]);

// Platforms on which Zernio can delete an already published post
// (POST /v1/posts/{id}/unpublish). Instagram does not allow it.
const UNPUBLISHABLE_PLATFORMS = Object.freeze([
    SOCIAL_PLATFORMS.TWITTER,
    SOCIAL_PLATFORMS.FACEBOOK,
    SOCIAL_PLATFORMS.LINKEDIN,
    SOCIAL_PLATFORMS.YOUTUBE,
    SOCIAL_PLATFORMS.THREADS,
]);

const PLATFORM_LABELS = Object.freeze({
    [SOCIAL_PLATFORMS.FACEBOOK]: "Facebook",
    [SOCIAL_PLATFORMS.INSTAGRAM]: "Instagram",
    [SOCIAL_PLATFORMS.TWITTER]: "Twitter",
    [SOCIAL_PLATFORMS.YOUTUBE]: "YouTube",
    [SOCIAL_PLATFORMS.THREADS]: "Threads",
    [SOCIAL_PLATFORMS.LINKEDIN]: "LinkedIn",
});

// The Zernio connect API expects its own casing for platform names; map the
// canonical lowercase identifiers to the external values.
const ZERNIO_PLATFORM_NAMES = Object.freeze({
    [SOCIAL_PLATFORMS.FACEBOOK]: "facebook",
    [SOCIAL_PLATFORMS.INSTAGRAM]: "Instagram",
    [SOCIAL_PLATFORMS.TWITTER]: "twitter",
    [SOCIAL_PLATFORMS.YOUTUBE]: "Youtube",
    [SOCIAL_PLATFORMS.THREADS]: "threads",
    [SOCIAL_PLATFORMS.LINKEDIN]: "linkedin",
});

// Platform values stored/returned before the canonical lowercase identifiers.
const LEGACY_PLATFORM_ALIASES = Object.freeze({
    x: SOCIAL_PLATFORMS.TWITTER,
});

// Normalize any external/legacy platform value to a canonical identifier
// (null when the platform is no longer supported).
const normalizePlatform = (value) => {
    const key = String(value ?? "")
        .trim()
        .toLowerCase();
    if (SUPPORTED_PLATFORMS.includes(key)) return key;
    return LEGACY_PLATFORM_ALIASES[key] || null;
};

module.exports = {
    SOCIAL_PLATFORMS,
    SUPPORTED_PLATFORMS,
    EDITABLE_PLATFORMS,
    UNPUBLISHABLE_PLATFORMS,
    PLATFORM_LABELS,
    ZERNIO_PLATFORM_NAMES,
    LEGACY_PLATFORM_ALIASES,
    normalizePlatform,
};
