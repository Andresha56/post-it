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
      trim: true,
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

module.exports = mongoose.model("Content", contentSchema);
