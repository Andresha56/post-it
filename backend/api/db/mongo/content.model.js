const mongoose = require("mongoose");

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
      type: [{ type: String, enum: ["instagram", "x", "facebook", "linkedin", "youtube"] }],
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
    },
    status: {
      type: String,
      enum: ["DRAFT", "SCHEDULED", "PUBLISHED", "FAILED"],
      default: "DRAFT",
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


const Content = mongoose.model("Content", contentSchema);

module.exports = Content;
