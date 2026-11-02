const { normalizePlatform } = require("../../api/constants/socialPlatforms");
const { CONTENT_STATUS } = require("../../api/constants/contentStatus");

/**
 * Pure helpers for the Zernio publishing flow. No network access, so every
 * branch is unit testable (see backend/tests/publishing.test.js).
 */

// Zernio marks an account unusable for posting through isActive /
// needsReconnection / enabled. Treat anything but a healthy account as
// disconnected so it is never offered or published to.
function isAccountConnected(account) {
    return (
        !!account &&
        account.isActive !== false &&
        account.needsReconnection !== true &&
        account.enabled !== false
    );
}

// Map a Zernio account onto the shape this app exposes, dropping platforms the
// app does not support.
function toConnectedAccount(account) {
    const platform = normalizePlatform(account?.platform);
    const accountId = account?.accountId ?? account?._id;

    if (!platform || !accountId) return null;

    return {
        accountId: String(accountId),
        platform,
        username: account.username ?? account.displayName ?? null,
    };
}

function normalizeConnectedAccounts(accounts = []) {
    return accounts
        .filter(isAccountConnected)
        .map(toConnectedAccount)
        .filter(Boolean);
}

// Resolve the account IDs a client selected against the accounts that are
// actually connected right now. Throws as soon as one is missing so a post is
// never partially targeted.
function resolveSelectedAccounts({ accountIds, connectedAccounts }) {
    if (!Array.isArray(accountIds) || accountIds.length === 0) {
        throw new Error("Select at least one connected account");
    }

    const byId = new Map(
        connectedAccounts.map((account) => [account.accountId, account]),
    );

    const seen = new Set();
    const selected = [];

    for (const rawId of accountIds) {
        const accountId = String(rawId ?? "").trim();

        if (!accountId || seen.has(accountId)) continue;
        seen.add(accountId);

        const account = byId.get(accountId);

        if (!account) {
            throw new Error(
                "One of the selected social accounts is no longer connected",
            );
        }

        selected.push(account);
    }

    if (selected.length === 0) {
        throw new Error("Select at least one connected account");
    }

    return selected;
}

// The platforms stored on the content record always derive from the selected
// accounts, never from client-supplied platform names.
function platformsFromAccounts(accounts) {
    return [...new Set(accounts.map((account) => account.platform))];
}

function assertFutureSchedule(scheduledAt, now = new Date()) {
    const scheduledDate = new Date(scheduledAt);

    if (!scheduledAt || Number.isNaN(scheduledDate.getTime()) || scheduledDate <= now) {
        throw new Error("A future scheduled time is required");
    }

    return scheduledDate;
}

/**
 * Build the body for zernio.posts.createPost. One request covers every
 * selected account, which is what Zernio's platforms[] array is for.
 */
function buildZernioPostBody({
    title,
    caption,
    accounts,
    mediaItems = [],
    hashtags = [],
    publishNow = false,
    scheduledFor,
}) {
    const body = {
        content: caption,
        platforms: accounts.map(({ platform, accountId }) => ({
            platform,
            accountId,
        })),
    };

    if (title) body.title = title;
    if (mediaItems.length > 0) body.mediaItems = mediaItems;
    if (hashtags.length > 0) body.hashtags = hashtags;

    // publishNow takes precedence over scheduledFor in the Zernio API, so only
    // ever send one of them.
    if (publishNow) {
        body.publishNow = true;
    } else {
        body.scheduledFor = new Date(scheduledFor).toISOString();
    }

    return body;
}

const PUBLISHED_PLATFORM_STATUS = "published";
const FAILED_PLATFORM_STATUS = "failed";

// Join the per-platform outcome Zernio reports back onto the accounts that
// were requested, so the UI can show exactly which account succeeded.
function buildAccountResults({ post, platformResults = [], requestedAccounts }) {
    const targets = Array.isArray(post?.platforms) ? post.platforms : [];

    return requestedAccounts.map((account) => {
        const target = targets.find((item) => {
            const targetId =
                typeof item?.accountId === "object"
                    ? (item.accountId?._id ?? item.accountId?.accountId)
                    : item?.accountId;

            return String(targetId ?? "") === account.accountId;
        });

        const fallback = platformResults.find(
            (item) => normalizePlatform(item?.platform) === account.platform,
        );

        return {
            accountId: account.accountId,
            platform: account.platform,
            status: target?.status ?? fallback?.status ?? "pending",
            platformPostId: target?.platformPostId ?? null,
            platformPostUrl: target?.platformPostUrl ?? null,
            publishedAt: target?.publishedAt ?? null,
            error: target?.error ?? fallback?.error ?? null,
        };
    });
}

const ZERNIO_TO_CONTENT_STATUS = Object.freeze({
    published: CONTENT_STATUS.PUBLISHED,
    // A partial publish still reached at least one account, so the post counts
    // as published and the failures are recorded per account.
    partial: CONTENT_STATUS.PUBLISHED,
    failed: CONTENT_STATUS.FAILED,
    cancelled: CONTENT_STATUS.CANCELLED,
    scheduled: CONTENT_STATUS.SCHEDULED,
    pending_approval: CONTENT_STATUS.SCHEDULED,
    publishing: CONTENT_STATUS.PUBLISHING,
    draft: CONTENT_STATUS.DRAFT,
});

/**
 * Translate a createPost response into the fields stored on the content record.
 * The status always comes from what Zernio reports, never from the fact that
 * the request was sent.
 */
function mapPublishResult({ response, requestedAccounts, publishNow }) {
    const post = response?.post;
    const zernioPostId = post?._id ? String(post._id) : null;

    if (!zernioPostId) {
        throw new Error("Zernio did not return a post ID");
    }

    const accountResults = buildAccountResults({
        post,
        platformResults: response?.platformResults ?? [],
        requestedAccounts,
    });

    const zernioStatus = String(post?.status ?? "").toLowerCase();
    const status =
        ZERNIO_TO_CONTENT_STATUS[zernioStatus] ??
        (publishNow ? CONTENT_STATUS.PUBLISHING : CONTENT_STATUS.SCHEDULED);

    const failed = accountResults.filter(
        (result) => result.status === FAILED_PLATFORM_STATUS,
    );
    const succeeded = accountResults.filter(
        (result) => result.status === PUBLISHED_PLATFORM_STATUS,
    );

    let statusReason = null;

    if (failed.length > 0) {
        statusReason = `Failed on ${failed
            .map((result) => result.platform)
            .join(", ")}: ${failed[0].error ?? response?.error ?? "unknown error"}`;
    } else if (response?.error) {
        statusReason = response.error;
    }

    return {
        zernioPostId,
        status,
        statusReason,
        accountResults,
        publishedAt:
            succeeded.length > 0
                ? new Date(succeeded[0].publishedAt ?? Date.now())
                : null,
    };
}

/**
 * Translate a Zernio post webhook (post.published / post.failed /
 * post.partial / post.cancelled) into the fields stored on the content record,
 * so a scheduled post ends up with the status Zernio actually reached.
 */
function mapPostEventToUpdate(post) {
    const targets = Array.isArray(post?.platforms) ? post.platforms : [];

    const accountResults = targets
        .map((target) => {
            const platform = normalizePlatform(target?.platform);

            if (!platform || !target?.accountId) return null;

            return {
                accountId: String(target.accountId),
                platform,
                status: target.status ?? "pending",
                platformPostId: target.platformPostId ?? null,
                platformPostUrl: target.publishedUrl ?? null,
                error: target.error ?? null,
            };
        })
        .filter(Boolean);

    const failed = accountResults.filter(
        (result) => result.status === FAILED_PLATFORM_STATUS,
    );

    const zernioStatus = String(post?.status ?? "").toLowerCase();
    const status = ZERNIO_TO_CONTENT_STATUS[zernioStatus] ?? null;

    const update = {
        status,
        statusReason:
            failed.length > 0
                ? `Failed on ${failed
                      .map((result) => result.platform)
                      .join(", ")}: ${failed[0].error ?? "unknown error"}`
                : null,
        publishedAt: post?.publishedAt ? new Date(post.publishedAt) : null,
    };

    if (accountResults.length > 0) update.accountResults = accountResults;

    return update;
}

module.exports = {
    isAccountConnected,
    toConnectedAccount,
    normalizeConnectedAccounts,
    resolveSelectedAccounts,
    platformsFromAccounts,
    assertFutureSchedule,
    buildZernioPostBody,
    buildAccountResults,
    mapPublishResult,
    mapPostEventToUpdate,
};
