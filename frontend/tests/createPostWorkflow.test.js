import test from "node:test";
import assert from "node:assert/strict";
import { createPostWorkflow } from "../src/lib/createPostWorkflow.js";
import { normalizeHashtags } from "../src/lib/hashtags.js";

const file = { type: "image/png", size: 100 };
const key = "users/u/media/123e4567-e89b-12d3-a456-426614174000.png";

test("hashtags normalize separators, prefixes, duplicates, and empty input", () => {
  assert.deepEqual(normalizeHashtags("#ProductLaunch, SocialMedia #productlaunch"), ["#ProductLaunch", "#SocialMedia"]);
  assert.deepEqual(normalizeHashtags("marketing, #SaaS, launch"), ["#marketing", "#SaaS", "#launch"]);
  assert.deepEqual(normalizeHashtags("  , ,, "), []);
});

test("text only content skips upload URL and upload", async () => {
  const calls = [];
  await createPostWorkflow({
    getUploadUrl: async () => { calls.push("url"); return {}; },
    uploadFile: async () => calls.push("upload"),
    createContent: async (keys) => { calls.push(["content", keys]); },
  });
  assert.deepEqual(calls, [["content", []]]);
});

test("media uploads sequentially before content and passes its key", async () => {
  const calls = [];
  await createPostWorkflow({
    file,
    getUploadUrl: async () => { calls.push("url"); return { uploadUrl: "https://example.test/signed", key }; },
    uploadFile: async () => calls.push("upload"),
    createContent: async (keys) => calls.push(["content", keys]),
  });
  assert.deepEqual(calls, ["url", "upload", ["content", [key]]]);
});

test("a verified upload key is reused after content creation fails", async () => {
  const calls = [];
  await assert.rejects(createPostWorkflow({
    file,
    getUploadUrl: async () => ({ uploadUrl: "https://example.test/signed", key }),
    uploadFile: async () => calls.push("upload"),
    createContent: async () => { calls.push("failed content"); throw new Error("database unavailable"); },
  }));
  await createPostWorkflow({
    file,
    existingKey: key,
    getUploadUrl: async () => { calls.push("url"); throw new Error("should not run"); },
    uploadFile: async () => calls.push("upload again"),
    createContent: async (keys) => calls.push(["retry", keys]),
  });
  assert.deepEqual(calls, ["upload", "failed content", ["retry", [key]]]);
});

for (const [name, getUploadUrl, uploadFile] of [
  ["URL generation failure", async () => { throw new Error("URL failed"); }, async () => {}],
  ["invalid URL", async () => ({ uploadUrl: "not a URL", key: "users/u/media/123e4567-e89b-12d3-a456-426614174000.png" }), async () => {}],
  ["missing object key", async () => ({ uploadUrl: "https://example.test/signed" }), async () => {}],
  ["malformed object key", async () => ({ uploadUrl: "https://example.test/signed", key: "blob:local-preview" }), async () => {}],
  ["S3 upload failure", async () => ({ uploadUrl: "https://example.test/signed", key }), async () => { throw new Error("S3 failed"); }],
]) {
  test(`${name} never creates content`, async () => {
    let createCalled = false;
    await assert.rejects(createPostWorkflow({
      file, getUploadUrl, uploadFile,
      createContent: async () => { createCalled = true; },
    }));
    assert.equal(createCalled, false);
  });
}
