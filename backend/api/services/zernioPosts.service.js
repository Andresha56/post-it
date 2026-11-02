const { zernio } = require("../../config/zernio");
const Content = require("../db/mongo/content.model");
const {
    CONTENT_STATUS,
    CANCELLABLE_STATUSES,
} = require("../constants/contentStatus");
const {
    buildZernioPostBody,
    mapPublishResult,
} = require("../../src/utils/publishing");
const { listConnectedAccounts } = require("./zernioAccounts.service");

/**
 * Zernio owns the scheduling and the publishing. This service only submits the
 * post, maps the response back onto the content record, and cancels a
 * scheduled post when it must not go out.
 */

async function submitPost({
    title,
    caption,
    hashtags,
    accounts,
    mediaItems,
    publishNow,
    scheduledFor,
    idempotencyKey,
}) {
    const body = buildZernioPostBody({
        title,
        caption,
        hashtags,
        accounts,
        mediaItems,
        publishNow,
        scheduledFor,
    });

    const { data } = await zernio.posts.createPost({
        // Reusing the key makes a retry of the same post safe instead of
        // publishing it twice.
        headers: idempotencyKey ? { "Idempotency-Key": idempotencyKey } : undefined,
        body,
    });

    return mapPublishResult({
        response: data,
        requestedAccounts: accounts,
        publishNow,
    });
}

// Removing the Zernio post is what actually stops a scheduled publish; a
// post that is already published cannot be deleted this way.
async function cancelZernioPost(zernioPostId) {
    await zernio.posts.deletePost({ path: { postId: zernioPostId } });
}

// PUT /v1/posts/{id} — only valid before the post is published. Fields that
// are omitted (e.g. mediaItems when the media did not change) are kept by Zernio.
async function updateScheduledPost({
    zernioPostId,
    title,
    caption,
    hashtags = [],
    mediaItems,
    scheduledFor,
}) {
    const body = {
        content: caption,
        hashtags,
        scheduledFor: new Date(scheduledFor).toISOString(),
    };

    if (title) body.title = title;
    if (mediaItems) body.mediaItems = mediaItems;

    const { data } = await zernio.posts.updatePost({
        path: { postId: zernioPostId },
        body,
    });

    return data;
}

// POST /v1/posts/{id}/edit — changes the text of one account's published copy.
async function editPublishedPost({ zernioPostId, platform, accountId, content }) {
    const { data } = await zernio.posts.editPost({
        path: { postId: zernioPostId },
        body: { platform, accountId, content },
    });

    return data;
}

// POST /v1/posts/{id}/unpublish — deletes one account's published copy from
// the social platform.
async function unpublishFromAccount({ zernioPostId, platform, accountId }) {
    const { data } = await zernio.posts.unpublishPost({
        path: { postId: zernioPostId },
        body: { platform, accountId },
    });

    return data;
}

/**
 * Cancel every scheduled post that targets the given account, for the whole
 * post rather than just that account: no selected account receives the post.
 *
 * Dependencies are injectable so the cascade can be unit tested without
 * Zernio or MongoDB.
 */
async function cancelScheduledPostsForAccount({
    accountId,
    reason,
    sub,
    model = Content,
    deletePost = cancelZernioPost,
}) {
    const filter = {
        accountIds: accountId,
        status: { $in: [...CANCELLABLE_STATUSES] },
    };

    if (sub) filter.userId = sub;

    const posts = await model.find(filter);
    const cancelled = [];

    for (const post of posts) {
        if (post.zernioPostId) {
            try {
                await deletePost(post.zernioPostId);
            } catch (error) {
                // Record the failure instead of leaving the post scheduled:
                // the status below stops this app from treating it as live,
                // and the reason tells the user to check Zernio.
                console.error("Failed to cancel Zernio post:", {
                    zernioPostId: post.zernioPostId,
                    message: error.message,
                });

                await model.updateOne(
                    { _id: post._id },
                    {
                        $set: {
                            status: CONTENT_STATUS.FAILED,
                            statusReason: `${reason} Cancelling the scheduled post with Zernio failed: ${error.message}`,
                        },
                    },
                );

                continue;
            }
        }

        await model.updateOne(
            { _id: post._id },
            {
                $set: {
                    status: CONTENT_STATUS.CANCELLED,
                    statusReason: reason,
                    scheduledAt: null,
                },
            },
        );

        cancelled.push(String(post._id));
    }

    return cancelled;
}

/**
 * Re-check the accounts behind the user's scheduled posts and cancel any post
 * whose accounts are no longer all connected. This runs when content is read,
 * so a disconnection that reached neither disconnectAccount nor the webhook
 * is still caught before the publish time, without a scheduler of our own.
 *
 * Failures are swallowed: a Zernio outage must not break reading content.
 */
async function revalidateScheduledPosts({ sub, posts, reason }) {
    const scheduled = posts.filter(
        (post) => post.status === CONTENT_STATUS.SCHEDULED,
    );

    if (scheduled.length === 0) return posts;

    let connectedIds;

    try {
        const accounts = await listConnectedAccounts(sub);
        connectedIds = new Set(accounts.map((account) => account.accountId));
    } catch (error) {
        console.error("Could not re-check scheduled posts:", error.message);
        return posts;
    }

    const stale = scheduled.filter((post) =>
        post.accountIds.some((accountId) => !connectedIds.has(accountId)),
    );

    if (stale.length === 0) return posts;

    for (const post of stale) {
        try {
            if (post.zernioPostId) await cancelZernioPost(post.zernioPostId);

            await Content.updateOne(
                { _id: post._id },
                {
                    $set: {
                        status: CONTENT_STATUS.CANCELLED,
                        statusReason: reason,
                        scheduledAt: null,
                    },
                },
            );

            post.status = CONTENT_STATUS.CANCELLED;
            post.statusReason = reason;
            post.scheduledAt = null;
        } catch (error) {
            console.error("Could not cancel a stale scheduled post:", {
                id: String(post._id),
                message: error.message,
            });
        }
    }

    return posts;
}

module.exports = {
    submitPost,
    cancelZernioPost,
    updateScheduledPost,
    editPublishedPost,
    unpublishFromAccount,
    cancelScheduledPostsForAccount,
    revalidateScheduledPosts,
};
