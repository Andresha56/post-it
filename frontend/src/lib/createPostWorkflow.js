/** Sequentially upload optional media before creating its content record. */
export async function createPostWorkflow({ file, existingKey, getUploadUrl, uploadFile, createContent }) {
  let mediaUrls = [];
  if (existingKey) {
    mediaUrls = [existingKey];
  } else if (file) {
    const result = await getUploadUrl(file);
    const uploadUrl = result?.uploadUrl;
    const key = result?.key;
    let parsedUrl;
    try {
      parsedUrl = new URL(uploadUrl);
    } catch {
      throw new Error("The upload service returned an invalid upload URL.");
    }
    const validKey = typeof key === "string" &&
      /^users\/[^/]+\/media\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp|mp4|webm)$/.test(key);
    if (
      (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") ||
      !parsedUrl.hostname || parsedUrl.username || parsedUrl.password ||
      !validKey
    ) {
      throw new Error("The upload service returned an invalid upload URL or object key.");
    }
    await uploadFile(uploadUrl, file, key);
    mediaUrls = [key];
  }
  return createContent(mediaUrls);
}
