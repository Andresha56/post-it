// Keep normalization rules in sync with backend/src/utils/hashtags.js.
export function normalizeHashtags(value) {
  const seen = new Set();
  return value.split(/[\s,]+/).flatMap((part) => {
    const body = part.replace(/^#+/, "");
    if (!body) return [];
    const tag = `#${body}`;
    const key = tag.toLowerCase();
    if (seen.has(key)) return [];
    seen.add(key);
    return [tag];
  });
}
