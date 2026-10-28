const IMAGE_EXTENSIONS = ["jpg", "png", "webp"];
const VIDEO_EXTENSIONS = ["mp4", "webm"];

// Media references are S3 object keys issued by createUploadUrl:
//   users/<cognito sub>/media/<uuid>.<ext>
// Anything else (URLs, blob: URLs, another user's keys) is rejected.
function assertValidMediaKeys({ userId, contentType, mediaUrls }) {
  const keyPattern = new RegExp(
    `^users/${userId.replace(/[^\w-]/g, "")}/media/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(${[
      ...IMAGE_EXTENSIONS,
      ...VIDEO_EXTENSIONS,
    ].join("|")})$`
  );

  for (const key of mediaUrls) {
    if (typeof key !== "string" || !keyPattern.test(key) || key.includes("..")) {
      throw new Error("Invalid media reference");
    }
  }

  const extensions = mediaUrls.map((key) => key.split(".").pop());
  if (contentType === "TEXT" && mediaUrls.length > 0) {
    throw new Error("Text content cannot include media");
  }
  if (contentType === "IMAGE" || contentType === "VIDEO") {
    const allowed = contentType === "IMAGE" ? IMAGE_EXTENSIONS : VIDEO_EXTENSIONS;
    if (mediaUrls.length === 0 || !extensions.every((ext) => allowed.includes(ext))) {
      throw new Error(`${contentType === "IMAGE" ? "Image" : "Video"} content requires matching media`);
    }
  }
}

module.exports = { assertValidMediaKeys };
