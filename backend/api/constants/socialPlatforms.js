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
    ZERNIO_PLATFORM_NAMES,
    LEGACY_PLATFORM_ALIASES,
    normalizePlatform,
};
