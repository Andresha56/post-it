const mongoose = require("mongoose");

// Zernio delivers webhooks at least once; the unique event ID makes the
// handler idempotent.
const webhookEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    event: { type: String, required: true },
    receivedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

const WebhookEvent = mongoose.model("WebhookEvent", webhookEventSchema);

module.exports = WebhookEvent;
