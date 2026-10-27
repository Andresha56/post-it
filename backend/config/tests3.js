const {
  S3Client,
  ListObjectsV2Command,
} = require("@aws-sdk/client-s3");

require("dotenv").config();

const s3 = new S3Client({
  region: process.env.AWS_REGION,
});

async function testS3Connection() {
  try {
    await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.AWS_S3_BUCKET,
        MaxKeys: 1,
        Prefix: "users/",
      })
    );

    console.log("S3 connection successful!");
  } catch (error) {
    console.error("S3 connection failed:", error.name, error.message);
  }
}

testS3Connection();