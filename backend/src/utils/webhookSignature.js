const crypto = require("node:crypto");

/**
 * Zernio signs the raw request body with HMAC-SHA256 and sends the lowercase
 * hex digest in X-Zernio-Signature (X-Late-Signature is the legacy alias).
 * The bytes must be verified exactly as received, so this route is mounted
 * before express.json().
 */
function verifyZernioSignature({ rawBody, signature, secret }) {
    if (!signature || !secret || !rawBody) return false;

    const expected = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest("hex");

    const received = Buffer.from(String(signature), "utf8");
    const computed = Buffer.from(expected, "utf8");

    if (received.length !== computed.length) return false;

    return crypto.timingSafeEqual(received, computed);
}

module.exports = { verifyZernioSignature };
