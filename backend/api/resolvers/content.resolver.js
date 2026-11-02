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
const {
  submitPost,
  revalidateScheduledPosts,
  cancelZernioPost,
  updateScheduledPost,
  editPublishedPost,
  unpublishFromAccount,
} = require("../services/zernioPosts.service.js");
const {
  getMediaPreviewUrls,
  deleteUnreferencedMedia,
} = require("../services/contentMedia.service.js");
const {
  EDITABLE_PLATFORMS,
  UNPUBLISHABLE_PLATFORMS,
  PLATFORM_LABELS,
} = require("../constants/socialPlatforms.js");

const PUBLISHED_ACCOUNT_STATUS = "published";
const label = (platform) => PLATFORM_LABELS[platform] ?? platform;
const sameKeys = (a = [], b = []) =>
  a.length === b.length && a.every((key, index) => key === b[index]);

const assertTitle = (title) => {
  if (typeof title !== "string" || !title.trim()) throw new Error("Title is required");
  if (title.trim().length > 30) throw new Error("Title must be 30 characters or fewer");
  return title.trim();
};

// "Updated on Twitter. Not supported on Instagram. Failed on Facebook: <error>."
function summarize(results, doneStatus, doneVerb) {
  const by = (status) => results.filter((result) => result.status === status);
  const names = (items) => items.map((result) => label(result.platform)).join(", ");
  const parts = [];

  if (by(doneStatus).length) parts.push(`${doneVerb} on ${names(by(doneStatus))}.`);
  if (by("unsupported").length) parts.push(`Not supported on ${names(by("unsupported"))}.`);
  for (const failed of by("failed")) parts.push(`Failed on ${label(failed.platform)}: ${failed.message}.`);

  return parts.join(" ");
}

// Zernio returns 404 for a post that is already gone, which is the goal anyway.
async function cancelIfPresent(zernioPostId) {
  try {
    await cancelZernioPost(zernioPostId);
  } catch (error) {
    if (error?.statusCode !== 404) throw error;
  }
}

// Push a caption change to every published copy whose platform supports editing.
async function editPublishedCopies(content, caption) {
  const results = [];

  for (const result of content.accountResults) {
    const base = { accountId: result.accountId, platform: result.platform };

    if (result.status !== PUBLISHED_ACCOUNT_STATUS) {
      results.push({ ...base, status: "skipped", message: "Not published on this account" });
    } else if (!EDITABLE_PLATFORMS.includes(result.platform)) {
      results.push({
        ...base,
        status: "unsupported",
        message: `${label(result.platform)} does not allow editing a published post`,
      });
    } else {
      try {
        const data = await editPublishedPost({
          zernioPostId: content.zernioPostId,
          platform: result.platform,
          accountId: result.accountId,
          content: caption,
        });
        // X assigns a new post ID on edit; keep the stored link pointing at the live post.
        if (data?.id) result.platformPostId = String(data.id);
        if (data?.url) result.platformPostUrl = data.url;
        results.push({ ...base, status: "updated", message: null });
      } catch (error) {
        results.push({ ...base, status: "failed", message: error.message || "Edit failed" });
      }
    }
  }

  return results;
}

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
  Content: {
    // Resolved only when a client asks for it (the view and edit screens).
    mediaPreviewUrls: async (content) => {
      if (!content.mediaUrls?.length) return [];
      try {
        return await getMediaPreviewUrls(content.mediaUrls);
      } catch (error) {
        console.error("Could not sign media preview URLs:", error.message);
        return [];
      }
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

    /**
     * Drafts, failed and cancelled posts are edited in MongoDB only. A scheduled
     * post is updated at Zernio first (PUT), so what goes out matches what is shown.
     * A published post can only have its caption changed, per account, where the
     * platform supports it; the stored caption changes only if an edit went through.
     */
    updateContent: async (_, { id, input }, { sub }) => {
      if (!sub) throw new Error("Unauthorized request");

      const content = await Content.findOne({ _id: id, userId: sub });
      if (!content) return { success: false, message: "Content not found", content: null, results: [] };

      const title = assertTitle(input.title ?? content.title);
      const caption = input.caption?.trim();
      if (!caption) throw new Error("Caption is required");

      const hashtags = normalizeHashtags(input.hashtags ?? content.hashtags ?? []);
      const contentType = input.contentType ?? content.contentType;
      const previousKeys = [...(content.mediaUrls ?? [])];
      const mediaKeys = input.mediaUrls ?? previousKeys;
      assertValidMediaKeys({ userId: sub, contentType, mediaUrls: mediaKeys });
      const mediaChanged = !sameKeys(mediaKeys, previousKeys);

      if (content.status === CONTENT_STATUS.PUBLISHING) {
        throw new Error("This post is being published right now. Try again once it finishes.");
      }

      let results = [];
      let message = "Post updated";

      if (content.status === CONTENT_STATUS.PUBLISHED) {
        if (mediaChanged) {
          throw new Error("Media can't be changed after a post is published. Only the caption can be edited.");
        }

        if (caption !== content.caption) {
          results = await editPublishedCopies(content, caption);
          const updated = results.filter((result) => result.status === "updated");
          message = summarize(results, "updated", "Updated");

          // Nothing changed on social media, so nothing is changed here either.
          if (updated.length === 0) {
            return { success: false, message: message || "No published account could be edited.", content, results };
          }

          content.caption = caption;
          const notApplied = results.filter((result) => ["failed", "unsupported"].includes(result.status));
          content.statusReason = notApplied.length
            ? `Caption edit not applied on ${notApplied.map((result) => label(result.platform)).join(", ")}.`
            : null;
        } else {
          message = "Post details updated. Nothing changed on social media.";
        }
      } else {
        if (content.status === CONTENT_STATUS.SCHEDULED && content.zernioPostId) {
          const scheduledFor = assertFutureSchedule(input.scheduledAt ?? content.scheduledAt);
          // Media is re-uploaded to Zernio only when it changed; omitted media is kept.
          const mediaItems = mediaChanged ? await buildMediaItems(mediaKeys) : undefined;

          await updateScheduledPost({
            zernioPostId: content.zernioPostId,
            title,
            caption,
            hashtags,
            mediaItems,
            scheduledFor,
          });

          content.scheduledAt = scheduledFor;
          message = "Scheduled post updated";
        }

        content.caption = caption;
        content.contentType = contentType;
        content.mediaUrls = mediaKeys;
      }

      content.title = title;
      content.hashtags = hashtags;
      await content.save();

      if (mediaChanged) {
        await deleteUnreferencedMedia(previousKeys.filter((key) => !mediaKeys.includes(key)));
      }

      return { success: true, message, content, results };
    },

    /**
     * APP_ONLY removes the record and cancels a scheduled publish; published copies stay
     * live. APP_AND_SOCIAL also unpublishes the copies on the chosen accounts (all
     * published accounts by default). If an external delete fails, the record is kept
     * with the real per-account outcome instead of claiming the post is gone.
     */
    deleteContent: async (_, { id, scope = "APP_ONLY", accountIds }, { sub }) => {
      if (!sub) throw new Error("Unauthorized request");

      const content = await Content.findOne({ _id: id, userId: sub });
      if (!content) return { success: false, message: "Content not found", content: null, results: [] };

      if (content.status === CONTENT_STATUS.PUBLISHING) {
        throw new Error("This post is being published right now. Wait for it to finish, then delete it.");
      }

      const results = [];
      let message = "Post deleted";

      if (content.status !== CONTENT_STATUS.PUBLISHED) {
        if (content.zernioPostId) {
          try {
            await cancelIfPresent(content.zernioPostId);
          } catch (error) {
            // A scheduled post that could not be cancelled would still go out.
            if (content.status === CONTENT_STATUS.SCHEDULED) {
              throw new Error(`Could not cancel the scheduled post with Zernio: ${error.message}`);
            }
            console.error("Could not remove the Zernio post:", error.message);
          }
        }
        if (content.status === CONTENT_STATUS.SCHEDULED) {
          message = "Post deleted and its scheduled publishing cancelled";
        }
      } else if (scope === "APP_AND_SOCIAL") {
        const published = content.accountResults.filter(
          (result) => result.status === PUBLISHED_ACCOUNT_STATUS,
        );
        const targets = accountIds?.length
          ? published.filter((result) => accountIds.includes(result.accountId))
          : published;

        if (accountIds?.length && targets.length !== new Set(accountIds).size) {
          throw new Error("Choose accounts this post was published to.");
        }

        for (const target of targets) {
          const base = { accountId: target.accountId, platform: target.platform };

          if (!UNPUBLISHABLE_PLATFORMS.includes(target.platform)) {
            results.push({
              ...base,
              status: "unsupported",
              message: `${label(target.platform)} does not allow deleting a published post`,
            });
            continue;
          }

          try {
            await unpublishFromAccount({
              zernioPostId: content.zernioPostId,
              platform: target.platform,
              accountId: target.accountId,
            });
            target.status = "deleted";
            target.platformPostUrl = null;
            results.push({ ...base, status: "deleted", message: null });
          } catch (error) {
            results.push({ ...base, status: "failed", message: error.message || "Delete failed" });
          }
        }

        message = summarize(results, "deleted", "Deleted");

        if (results.some((result) => result.status === "failed")) {
          content.statusReason = `Deleting from social media failed: ${message}`;
          await content.save();
          return { success: false, message: `The post was kept. ${message}`, content, results };
        }

        message = `Post deleted. ${message}`.trim();
      } else {
        message = "Post deleted from this app. It stays live on social media.";
      }

      await Content.deleteOne({ _id: content._id, userId: sub });
      await deleteUnreferencedMedia(content.mediaUrls);

      return { success: true, message, content, results };
    },
  },
};

module.exports = contentResolver;
