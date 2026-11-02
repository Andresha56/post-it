process.env.ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || "sk_test_dummy";

const test = require("node:test");
const assert = require("node:assert/strict");

const { CONTENT_STATUS } = require("../api/constants/contentStatus");

// Stub every Zernio/S3/Mongo dependency before the resolver loads, so the edit and
// delete branches can be exercised without the network.
const calls = [];
const handlers = {};
const record = (name) => (...args) => {
  calls.push({ name, args });
  return handlers[name] ? handlers[name](...args) : undefined;
};

function stubModule(modulePath, exports) {
  const filename = require.resolve(modulePath);
  require.cache[filename] = { id: filename, filename, loaded: true, exports };
}

stubModule("../api/services/zernioAccounts.service.js", { getSelectedAccounts: record("getSelectedAccounts") });
stubModule("../api/services/zernioMedia.service.js", { buildMediaItems: record("buildMediaItems") });
stubModule("../api/services/zernioPosts.service.js", {
  submitPost: record("submitPost"),
  revalidateScheduledPosts: record("revalidateScheduledPosts"),
  cancelZernioPost: record("cancelZernioPost"),
  updateScheduledPost: record("updateScheduledPost"),
  editPublishedPost: record("editPublishedPost"),
  unpublishFromAccount: record("unpublishFromAccount"),
});
stubModule("../api/services/contentMedia.service.js", {
  getMediaPreviewUrls: record("getMediaPreviewUrls"),
  deleteUnreferencedMedia: record("deleteUnreferencedMedia"),
});
stubModule("../api/db/mongo/content.model.js", {
  findOne: record("findOne"),
  deleteOne: record("deleteOne"),
});

const { Mutation } = require("../api/resolvers/content.resolver.js");

const SUB = "user-1";
const KEY = (n) => `users/${SUB}/media/0000000${n}-0000-4000-8000-000000000000.png`;
const called = (name) => calls.filter((call) => call.name === name);

function makePost(overrides = {}) {
  const post = {
    _id: "post-1",
    title: "Launch",
    caption: "Old caption",
    contentType: "IMAGE",
    mediaUrls: [KEY(1)],
    hashtags: ["#a"],
    status: CONTENT_STATUS.SCHEDULED,
    zernioPostId: "z-1",
    scheduledAt: new Date(Date.now() + 3_600_000),
    accountResults: [],
    statusReason: null,
    ...overrides,
  };
  post.save = async () => calls.push({ name: "save", args: [] });
  return post;
}

function reset(post) {
  calls.length = 0;
  for (const key of Object.keys(handlers)) delete handlers[key];
  handlers.findOne = async () => post;
}

test("updating a scheduled post updates the Zernio post before MongoDB", async () => {
  const post = makePost();
  reset(post);
  handlers.buildMediaItems = async () => [{ url: "https://zernio/media.png" }];
  const when = new Date(Date.now() + 7_200_000).toISOString();

  const res = await Mutation.updateContent(
    null,
    { id: "post-1", input: { title: "Launch", caption: "New caption", mediaUrls: [KEY(2)], contentType: "IMAGE", scheduledAt: when } },
    { sub: SUB },
  );

  assert.equal(res.success, true);
  const [update] = called("updateScheduledPost");
  assert.equal(update.args[0].zernioPostId, "z-1");
  assert.equal(update.args[0].caption, "New caption");
  assert.deepEqual(update.args[0].mediaItems, [{ url: "https://zernio/media.png" }]);
  assert.equal(post.caption, "New caption");
  assert.deepEqual(post.mediaUrls, [KEY(2)]);
  assert.equal(called("save").length, 1);
  // The replaced S3 key is offered for cleanup (it is only deleted if unreferenced).
  assert.deepEqual(called("deleteUnreferencedMedia")[0].args[0], [KEY(1)]);
});

test("a failed Zernio update leaves the stored post unchanged", async () => {
  const post = makePost();
  reset(post);
  handlers.updateScheduledPost = async () => {
    throw new Error("Zernio is down");
  };

  await assert.rejects(
    Mutation.updateContent(null, { id: "post-1", input: { caption: "New caption" } }, { sub: SUB }),
    /Zernio is down/,
  );
  assert.equal(post.caption, "Old caption");
  assert.equal(called("save").length, 0);
});

test("editing a published caption only targets platforms that support it", async () => {
  const post = makePost({
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [
      { accountId: "acc-x", platform: "twitter", status: "published", platformPostId: "1" },
      { accountId: "acc-ig", platform: "instagram", status: "published", platformPostId: "2" },
      { accountId: "acc-fb", platform: "facebook", status: "failed", platformPostId: null },
    ],
  });
  reset(post);
  handlers.editPublishedPost = async () => ({ id: "99", url: "https://x.com/p/99" });

  const res = await Mutation.updateContent(null, { id: "post-1", input: { caption: "Edited" } }, { sub: SUB });

  assert.equal(res.success, true);
  const edits = called("editPublishedPost");
  assert.equal(edits.length, 1);
  assert.deepEqual(edits[0].args[0], { zernioPostId: "z-1", platform: "twitter", accountId: "acc-x", content: "Edited" });
  assert.deepEqual(res.results.map((r) => r.status), ["updated", "unsupported", "skipped"]);
  assert.equal(post.accountResults[0].platformPostId, "99");
  assert.match(post.statusReason, /Instagram/);
});

test("a published edit that fails everywhere is reported and not saved", async () => {
  const post = makePost({
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [{ accountId: "acc-x", platform: "twitter", status: "published" }],
  });
  reset(post);
  handlers.editPublishedPost = async () => {
    throw new Error("Edit window expired");
  };

  const res = await Mutation.updateContent(null, { id: "post-1", input: { caption: "Edited" } }, { sub: SUB });

  assert.equal(res.success, false);
  assert.match(res.message, /Edit window expired/);
  assert.equal(post.caption, "Old caption");
  assert.equal(called("save").length, 0);
});

test("changing media of a published post is refused", async () => {
  const post = makePost({ status: CONTENT_STATUS.PUBLISHED });
  reset(post);

  await assert.rejects(
    Mutation.updateContent(null, { id: "post-1", input: { caption: "Old caption", mediaUrls: [KEY(2)] } }, { sub: SUB }),
    /Media can't be changed/,
  );
});

test("deleting a scheduled post cancels it at Zernio, then removes the record", async () => {
  const post = makePost();
  reset(post);

  const res = await Mutation.deleteContent(null, { id: "post-1", scope: "APP_ONLY" }, { sub: SUB });

  assert.equal(res.success, true);
  assert.equal(called("cancelZernioPost")[0].args[0], "z-1");
  assert.equal(called("deleteOne").length, 1);
  assert.match(res.message, /scheduled publishing cancelled/);
});

test("a scheduled post whose Zernio cancel fails is not deleted", async () => {
  const post = makePost();
  reset(post);
  handlers.cancelZernioPost = async () => {
    throw Object.assign(new Error("boom"), { statusCode: 500 });
  };

  await assert.rejects(Mutation.deleteContent(null, { id: "post-1" }, { sub: SUB }), /Could not cancel/);
  assert.equal(called("deleteOne").length, 0);
});

test("APP_ONLY delete of a published post never touches the social accounts", async () => {
  const post = makePost({
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [{ accountId: "acc-x", platform: "twitter", status: "published" }],
  });
  reset(post);

  const res = await Mutation.deleteContent(null, { id: "post-1", scope: "APP_ONLY" }, { sub: SUB });

  assert.equal(res.success, true);
  assert.equal(called("unpublishFromAccount").length, 0);
  assert.equal(called("cancelZernioPost").length, 0);
  assert.equal(called("deleteOne").length, 1);
});

test("APP_AND_SOCIAL unpublishes only the chosen account", async () => {
  const post = makePost({
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [
      { accountId: "acc-x", platform: "twitter", status: "published" },
      { accountId: "acc-li", platform: "linkedin", status: "published" },
    ],
  });
  reset(post);

  const res = await Mutation.deleteContent(
    null,
    { id: "post-1", scope: "APP_AND_SOCIAL", accountIds: ["acc-li"] },
    { sub: SUB },
  );

  assert.equal(res.success, true);
  const unpublished = called("unpublishFromAccount");
  assert.equal(unpublished.length, 1);
  assert.deepEqual(unpublished[0].args[0], { zernioPostId: "z-1", platform: "linkedin", accountId: "acc-li" });
  assert.equal(called("deleteOne").length, 1);
});

test("a failed social delete keeps the record and reports the real outcome", async () => {
  const post = makePost({
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [
      { accountId: "acc-x", platform: "twitter", status: "published" },
      { accountId: "acc-fb", platform: "facebook", status: "published" },
    ],
  });
  reset(post);
  handlers.unpublishFromAccount = async ({ platform }) => {
    if (platform === "facebook") throw new Error("Token expired");
    return { success: true };
  };

  const res = await Mutation.deleteContent(null, { id: "post-1", scope: "APP_AND_SOCIAL" }, { sub: SUB });

  assert.equal(res.success, false);
  assert.deepEqual(res.results.map((r) => r.status), ["deleted", "failed"]);
  assert.equal(called("deleteOne").length, 0);
  assert.equal(post.accountResults[0].status, "deleted");
  assert.equal(post.accountResults[1].status, "published");
});

test("Instagram copies are reported as unsupported, not deleted", async () => {
  const post = makePost({
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [{ accountId: "acc-ig", platform: "instagram", status: "published" }],
  });
  reset(post);

  const res = await Mutation.deleteContent(null, { id: "post-1", scope: "APP_AND_SOCIAL" }, { sub: SUB });

  assert.equal(called("unpublishFromAccount").length, 0);
  assert.equal(res.results[0].status, "unsupported");
  assert.match(res.message, /Not supported on Instagram/);
});

test("another user's post is never found", async () => {
  reset(null);
  const res = await Mutation.deleteContent(null, { id: "post-1" }, { sub: SUB });
  assert.equal(res.success, false);
  assert.deepEqual(called("findOne")[0].args[0], { _id: "post-1", userId: SUB });
});
