const crypto = require("node:crypto");

const Content = require("../db/mongo/content.model.js");
const { normalizeHashtags } = require("../../src/utils/hashtags.js");
const { assertValidMediaKeys } = require("../../src/utils/mediaKeys.js");
const {
  CONTENT_STATUS,
  CREATABLE_STATUSES,
  DISCONNECTED_ACCOUNT_REASON,
} = require("../constants/contentStatus.js");
const {
  assertFutureSchedule,
  platformsFromAccounts,
} = require("../../src/utils/publishing.js");
const { getSelectedAccounts } = require("../services/zernioAccounts.service.js");
const { buildMediaItems } = require("../services/zernioMedia.service.js");
const { submitPost, revalidateScheduledPosts } = require("../services/zernioPosts.service.js");

const contentResolver = {
  Query: {
    getContent: async (_, { id }, { sub }) => {
      if (!sub) throw new Error("Unauthorized request");
      const content = await Content.findOne({ _id: id, userId: sub });
      if (!content) return { success: false, message: "Content not found", content: null };
      return { success: true, message: "Content retrieved successfully", content };
    },
    getContents: async (_, { page = 1, limit = 20, status, contentType }, { sub }) => {
      if (!sub) throw new Error("Unauthorized request");
      const safePage = Number.isInteger(page) && page > 0 ? page : 1;
      const safeLimit = Number.isInteger(limit) ? Math.min(Math.max(limit, 1), 100) : 20;
      const filter = { userId: sub };
      if (status) filter.status = status;
      if (contentType) filter.contentType = contentType;
      const [contents, total] = await Promise.all([
        Content.find(filter).sort({ createdAt: -1 }).skip((safePage - 1) * safeLimit).limit(safeLimit),
        Content.countDocuments(filter),
      ]);
      // Catch an account that was disconnected without this app hearing about
      // it, before its scheduled post can publish.
      const checked = await revalidateScheduledPosts({
        sub,
        posts: contents,
        reason: DISCONNECTED_ACCOUNT_REASON,
      });
      return { success: true, message: "Content retrieved successfully", contents: checked, total };
    },
  },
  Mutation: {
    createContent: async (_, { input }, { sub }) => {
      if (!sub) {
        throw new Error("Unauthorized request");
      }
      try {
        const {
          caption,
          contentType,
          title,
          status = CONTENT_STATUS.DRAFT,
          mediaUrls,
          hashtags,
          scheduledAt,
          accountIds = [],
        } = input;

        const normalizedHashtags = normalizeHashtags(hashtags ?? []);
        if (typeof title !== "string" || !title.trim()) {
          throw new Error("Title is required");
        }
        if (title.trim().length > 30) {
          throw new Error("Title must be 30 characters or fewer");
        }
        // mediaUrls holds S3 object keys issued by createUploadUrl, never URLs.
        const mediaKeys = mediaUrls ?? [];
        assertValidMediaKeys({ userId: sub, contentType, mediaUrls: mediaKeys });

        if (!caption?.trim()) {
          throw new Error("Caption is required");
        }

        // FAILED, CANCELLED and PUBLISHING are only ever set by the
        // publishing workflow itself.
        if (!CREATABLE_STATUSES.includes(status)) {
          throw new Error(
            "Content can only be created as a draft, scheduled or published",
          );
        }

        const isDraft = status === CONTENT_STATUS.DRAFT;

        // The client sends an ISO-8601 UTC timestamp; it is stored as a Date.
        const scheduledDate =
          status === CONTENT_STATUS.SCHEDULED
            ? assertFutureSchedule(scheduledAt)
            : null;

        // Every account ID is checked against the accounts Zernio reports as
        // connected for this user's profile, which covers ownership and the
        // "must be connected" rule in one step.
        const accounts =
          isDraft && accountIds.length === 0
            ? []
            : await getSelectedAccounts(sub, accountIds);

        const platforms = platformsFromAccounts(accounts);

        let publishResult = null;

        if (!isDraft) {
          // Media has to be reachable by Zernio before the post is submitted;
          // a failure here aborts before anything is written or published.
          const mediaItems = await buildMediaItems(mediaKeys);

          publishResult = await submitPost({
            title: title.trim(),
            caption: caption.trim(),
            hashtags: normalizedHashtags,
            accounts,
            mediaItems,
            publishNow: status === CONTENT_STATUS.PUBLISHED,
            scheduledFor: scheduledDate,
            idempotencyKey: crypto.randomUUID(),
          });
        }

        const content = await Content.create({
          userId: sub,
          title: title.trim(),
          platforms,
          caption: caption.trim(),
          contentType,
          // The stored status always reflects what Zernio reported, not what
          // the client asked for.
          status: publishResult?.status ?? status,
          statusReason: publishResult?.statusReason ?? null,
          zernioPostId: publishResult?.zernioPostId ?? null,
          accountResults: publishResult?.accountResults ?? [],
          mediaUrls: mediaKeys,
          hashtags: normalizedHashtags,
          accountIds: accounts.map((account) => account.accountId),
          scheduledAt: scheduledDate,
          publishedAt: publishResult?.publishedAt ?? null,
        });

        return {
          success: true,
          message: "Content created successfully",
          content,
        };
      } catch (error) {
        throw new Error(error.message || "Failed to create content");
      }
    },
  },
};

module.exports = contentResolver;
