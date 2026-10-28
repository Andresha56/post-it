// Keep in sync with frontend/src/lib/hashtags.js.
const MAX_HASHTAGS = 30;
const MAX_HASHTAG_LENGTH = 50; // including the leading '#'
const HASHTAG_PATTERN = /^#[\p{L}\p{N}_]+$/u;

// Accepts a list of entries (each may itself hold several space/comma separated tags).
// Returns normalized tags with exactly one leading '#', de-duplicated case-insensitively,
// keeping the casing of the first occurrence. Throws on tags that are invalid.
function normalizeHashtags(input) {
  const entries = Array.isArray(input) ? input : [input];
  const seen = new Set();
  const result = [];

  for (const entry of entries) {
    if (typeof entry !== "string") {
      throw new Error("Hashtags must be strings");
    }
    for (const part of entry.split(/[\s,]+/)) {
      const body = part.replace(/^#+/, "");
      if (!body) continue;
      const tag = `#${body}`;
      if (tag.length > MAX_HASHTAG_LENGTH || !HASHTAG_PATTERN.test(tag)) {
        throw new Error(
          `Invalid hashtag "${tag.slice(0, 20)}": use letters, numbers and underscores only (max ${MAX_HASHTAG_LENGTH} characters)`
        );
      }
      const lower = tag.toLowerCase();
      if (seen.has(lower)) continue;
      seen.add(lower);
      result.push(tag);
    }
  }

  if (result.length > MAX_HASHTAGS) {
    throw new Error(`Use at most ${MAX_HASHTAGS} hashtags`);
  }
  return result;
}

module.exports = { normalizeHashtags, MAX_HASHTAGS };
