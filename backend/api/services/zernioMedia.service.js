const { GetObjectCommand } = require("@aws-sdk/client-s3");

const s3 = require("../../config/s3");
const { zernio } = require("../../config/zernio");

/**
 * Media lives in a private S3 bucket, but Zernio needs a publicly reachable
 * HTTPS URL at publish time (including for a post scheduled days ahead).
 * Each S3 object is therefore copied into Zernio's own media storage through
 * the documented presign flow, which returns a non-expiring public URL.
 */

const MIME_TYPES = {
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
};

const mediaTypeFor = (mimeType) =>
    mimeType.startsWith("video/") ? "video" : "image";

async function readS3Object(key) {
    const response = await s3.send(
        new GetObjectCommand({
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        }),
    );

    const buffer = Buffer.from(await response.Body.transformToByteArray());

    if (buffer.length === 0) {
        throw new Error("Uploaded media could not be read");
    }

    return buffer;
}

async function uploadToZernio({ buffer, filename, contentType }) {
    const { data } = await zernio.media.getMediaPresignedUrl({
        body: { filename, contentType, size: buffer.length },
    });

    if (!data?.uploadUrl || !data?.publicUrl) {
        throw new Error("Zernio did not return a media upload URL");
    }

    const response = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": contentType },
        body: buffer,
    });

    if (!response.ok) {
        throw new Error(`Media upload failed (${response.status})`);
    }

    return {
        type: mediaTypeFor(contentType),
        url: data.publicUrl,
        filename,
        size: buffer.length,
        mimeType: contentType,
    };
}

/**
 * Turn the S3 object keys stored on a content record into Zernio mediaItems.
 * Any failure propagates so the caller can refuse to publish or schedule.
 */
async function buildMediaItems(mediaKeys = []) {
    const items = [];

    for (const key of mediaKeys) {
        const extension = String(key).split(".").pop();
        const contentType = MIME_TYPES[extension];

        if (!contentType) {
            throw new Error("Unsupported media type for publishing");
        }

        const buffer = await readS3Object(key);

        items.push(
            await uploadToZernio({
                buffer,
                filename: String(key).split("/").pop(),
                contentType,
            }),
        );
    }

    return items;
}

module.exports = { buildMediaItems };
