const { PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const crypto = require("crypto");

const s3 = require("../../config/s3");

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

async function generatePresignedUrl({ userId, contentType, fileSize }) {
  if (!ALLOWED_TYPES[contentType]) {
    throw new Error("Unsupported file type");
  }

  if (
    !Number.isSafeInteger(fileSize) ||
    fileSize <= 0 ||
    fileSize > MAX_FILE_SIZE
  ) {
    throw new Error("File size must be between 1 byte and 5 MB");
  }

  const extension = ALLOWED_TYPES[contentType];
  const key = `users/${userId}/media/${crypto.randomUUID()}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(s3, command, {
    expiresIn: 300,
  });

  return { uploadUrl, key };
}

module.exports = { generatePresignedUrl };