const { DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

const s3 = require("../../config/s3");
const Content = require("../db/mongo/content.model");

const PREVIEW_URL_TTL_SECONDS = 60 * 60;

// The media bucket is private; the UI displays media through short-lived signed GET URLs.
async function getMediaPreviewUrls(keys = []) {
    return Promise.all(
        keys.map((key) =>
            getSignedUrl(
                s3,
                new GetObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }),
                { expiresIn: PREVIEW_URL_TTL_SECONDS },
            ),
        ),
    );
}

/**
 * Delete S3 objects that no content record references any more. Call it after the
 * record was deleted or updated, so a key still used by another post is kept.
 * Failures are logged only: an orphaned object must not fail the user's action.
 */
async function deleteUnreferencedMedia(
    keys = [],
    { model = Content, send = (command) => s3.send(command) } = {},
) {
    const deleted = [];

    for (const key of new Set(keys)) {
        try {
            if (await model.exists({ mediaUrls: key })) continue;

            await send(
                new DeleteObjectCommand({ Bucket: process.env.AWS_S3_BUCKET, Key: key }),
            );
            deleted.push(key);
        } catch (error) {
            console.error("Could not delete unreferenced media:", { key, message: error.message });
        }
    }

    return deleted;
}

module.exports = { getMediaPreviewUrls, deleteUnreferencedMedia };
