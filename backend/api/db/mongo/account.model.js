const mongooe = require("mongoose");

const accountSchema = new mongooe.Schema(
  {
    sub: { type: String, required: true, unique: true },
    platform: {
      type: String,
      enum: ["Instagram", "X", "facebook", "linkedin", "Youtube"],
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
