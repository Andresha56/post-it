const mongoose = require("mongoose");
const { SOCIAL_PLATFORMS } = require("../../constants/socialPlatforms");
const {
  CONTENT_STATUS,
  CONTENT_STATUS_LIST,
} = require("../../constants/contentStatus");

// Per-account outcome of the publish attempt, mirrored from the Zernio
// response so the UI can show exactly which account succeeded or failed.
const accountResultSchema = new mongoose.Schema(
  {
    accountId: { type: String, required: true },
    platform: {
      type: String,
      enum: Object.values(SOCIAL_PLATFORMS),
      required: true,
    },
    status: { type: String, required: true },
    platformPostId: { type: String, default: null },
    platformPostUrl: { type: String, default: null },
    error: { type: String, default: null },
  },
  { _id: false },
);

const contentSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 30,
    },
    platforms: {
      type: [{ type: String, enum: Object.values(SOCIAL_PLATFORMS) }],
      required: true,
      default: [],
    },
    caption: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["TEXT", "IMAGE", "VIDEO", "CAROUSEL"],
      required: true,
    },
    mediaUrls: {
      type: [String],
      default: [],
    },
    hashtags: {
      type: [String],
      default: [],
    },
    accountIds: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: CONTENT_STATUS_LIST,
      default: CONTENT_STATUS.DRAFT,
    },
    // Why the post is in its current status (a failure detail, or the account
    // disconnection that cancelled it).
    statusReason: {
      type: String,
      default: null,
    },
    // The Zernio post this record was submitted as. Zernio owns the schedule,
    // so this is the handle used to cancel it.
    zernioPostId: {
      type: String,
      default: null,
      index: true,
    },
    accountResults: {
      type: [accountResultSchema],
      default: [],
    },
    scheduledAt: {
      type: Date,
      default: null,
    },
    publishedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);


// A Zernio post is submitted once; the unique index makes a duplicate write
// impossible even if a retry slips past the Idempotency-Key.
contentSchema.index(
  { zernioPostId: 1 },
  { unique: true, partialFilterExpression: { zernioPostId: { $type: "string" } } },
);

const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
