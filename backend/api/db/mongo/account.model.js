const mongooe = require("mongoose");
const { SOCIAL_PLATFORMS } = require("../../constants/socialPlatforms");

const accountSchema = new mongooe.Schema(
  {
    sub: { type: String, required: true, unique: true },
    platform: {
      type: String,
      enum: Object.values(SOCIAL_PLATFORMS),
      required: true,
    },
    zernioAccountId: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["connected", "disconnected"],
      default: "disconnected",
    },
    avatarUrl: { type: String },
  },
  {
    timestamps: true,
  },
);

export const Account = mongooe.model("Account", accountSchema);
