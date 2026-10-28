const Content = require("../db/mongo/content.model.js");
const { normalizeHashtags } = require("../../src/utils/hashtags.js");
const { assertValidMediaKeys } = require("../../src/utils/mediaKeys.js");
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
      return { success: true, message: "Content retrieved successfully", contents, total };
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
          platforms,
          status = "DRAFT",
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
        if (!Array.isArray(platforms) || platforms.length === 0) {
          throw new Error("Select at least one platform");
        }
        // mediaUrls holds S3 object keys issued by createUploadUrl, never URLs.
        const mediaKeys = mediaUrls ?? [];
        assertValidMediaKeys({ userId: sub, contentType, mediaUrls: mediaKeys });

        if (!caption?.trim()) {
          throw new Error("Caption is required");
        }

        // PUBLISHED and FAILED are only ever set by the publishing workflow.
        if (status !== "DRAFT" && status !== "SCHEDULED") {
          throw new Error("Content can only be created as a draft or scheduled");
        }

        // The client sends an ISO-8601 UTC timestamp; it is stored as a Date.
        let scheduledDate = null;
        if (status === "SCHEDULED") {
          scheduledDate = new Date(scheduledAt);
          if (
            !scheduledAt ||
            Number.isNaN(scheduledDate.getTime()) ||
            scheduledDate <= new Date()
          ) {
            throw new Error("A future scheduled time is required");
          }
        }
        const content = await Content.create({
          userId: sub,
          title: title.trim(),
          platforms,
          caption: caption.trim(),
          contentType,
          status,
          mediaUrls: mediaKeys,
          hashtags: normalizedHashtags,
          accountIds,
          scheduledAt: scheduledDate,
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
