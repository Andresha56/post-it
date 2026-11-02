const Content = require("../db/mongo/content.model");
const WebhookEvent = require("../db/mongo/webhookEvent.model");
const { DISCONNECTED_ACCOUNT_REASON } = require("../constants/contentStatus");
const { verifyZernioSignature } = require("../../src/utils/webhookSignature");
const { mapPostEventToUpdate } = require("../../src/utils/publishing");
const {
    cancelScheduledPostsForAccount,
} = require("../services/zernioPosts.service");

/**
 * Safety net for the account disconnection rule. A connection can also drop
 * outside this app (revoked access, expired token); Zernio reports that as
 * account.disconnected, and every scheduled post targeting the account is
 * cancelled in full before its publish time.
 *
 * Post events keep the stored status in sync with what Zernio actually did.
 */

const SUBSCRIBED_EVENTS = Object.freeze([
    "account.disconnected",
    "post.published",
    "post.failed",
    "post.partial",
    "post.cancelled",
]);

async function handleAccountDisconnected(event) {
    const accountId = event?.account?.accountId;

    if (!accountId) return;

    const reason = event.account.reason
        ? `${DISCONNECTED_ACCOUNT_REASON} (${event.account.reason})`
        : DISCONNECTED_ACCOUNT_REASON;

    await cancelScheduledPostsForAccount({ accountId: String(accountId), reason });
}

async function handlePostEvent(event) {
    const zernioPostId = event?.post?.id;

    if (!zernioPostId) return;

    const update = mapPostEventToUpdate(event.post);

    if (!update.status) return;

    await Content.updateOne(
        { zernioPostId: String(zernioPostId) },
        { $set: update },
    );
}

async function zernioWebhookHandler(req, res) {
    const signature =
        req.get("X-Zernio-Signature") || req.get("X-Late-Signature");

    const isValid = verifyZernioSignature({
        rawBody: Buffer.isBuffer(req.body) ? req.body : null,
        signature,
        secret: process.env.ZERNIO_WEBHOOK_SECRET,
    });

    if (!isValid) {
        return res.sendStatus(401);
    }

    let event;

    try {
        event = JSON.parse(req.body.toString("utf8"));
    } catch {
        return res.sendStatus(400);
    }

    if (!event?.id || !SUBSCRIBED_EVENTS.includes(event.event)) {
        // Acknowledge anything that is signed but not handled here, so Zernio
        // does not keep retrying it.
        return res.sendStatus(200);
    }

    try {
        await WebhookEvent.create({ eventId: event.id, event: event.event });
    } catch (error) {
        // Duplicate delivery of an event that was already processed.
        if (error?.code === 11000) return res.sendStatus(200);

        console.error("Webhook event could not be recorded:", error.message);
        return res.sendStatus(500);
    }

    try {
        if (event.event === "account.disconnected") {
            await handleAccountDisconnected(event);
        } else {
            await handlePostEvent(event);
        }
    } catch (error) {
        console.error("Webhook handling failed:", {
            event: event.event,
            message: error.message,
        });

        return res.sendStatus(500);
    }

    return res.sendStatus(200);
}

module.exports = { zernioWebhookHandler, SUBSCRIBED_EVENTS };
