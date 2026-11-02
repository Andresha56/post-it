/**
 * Centralized content lifecycle statuses.
 * Must stay in sync with frontend/src/constant/content.ts (Status enum)
 * and the ContentStatus enum in api/typeDefs/content.typeDefs.js.
 */
const CONTENT_STATUS = Object.freeze({
    DRAFT: "DRAFT",
    SCHEDULED: "SCHEDULED",
    PUBLISHING: "PUBLISHING",
    PUBLISHED: "PUBLISHED",
    FAILED: "FAILED",
    CANCELLED: "CANCELLED",
});

const CONTENT_STATUS_LIST = Object.values(CONTENT_STATUS);

// Statuses a client is allowed to ask for when creating content.
const CREATABLE_STATUSES = Object.freeze([
    CONTENT_STATUS.DRAFT,
    CONTENT_STATUS.SCHEDULED,
    CONTENT_STATUS.PUBLISHED,
]);

// Statuses that still have a live Zernio post behind them.
const CANCELLABLE_STATUSES = Object.freeze([CONTENT_STATUS.SCHEDULED]);

const DISCONNECTED_ACCOUNT_REASON =
    "A selected social account was disconnected before publishing.";

module.exports = {
    CONTENT_STATUS,
    CONTENT_STATUS_LIST,
    CREATABLE_STATUSES,
    CANCELLABLE_STATUSES,
    DISCONNECTED_ACCOUNT_REASON,
};
