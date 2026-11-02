process.env.ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || "sk_test_dummy";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  cancelScheduledPostsForAccount,
} = require("../api/services/zernioPosts.service");
const {
  CONTENT_STATUS,
  DISCONNECTED_ACCOUNT_REASON,
} = require("../api/constants/contentStatus");

// Minimal stand-in for the Mongoose model: records the filters it was queried
// with and the updates it was asked to apply.
function createModelStub(posts) {
  const updates = [];
  const queries = [];

  return {
    updates,
    queries,
    async find(filter) {
      queries.push(filter);

      return posts.filter(
        (post) =>
          post.accountIds.includes(filter.accountIds) &&
          filter.status.$in.includes(post.status) &&
          (!filter.userId || post.userId === filter.userId),
      );
    },
    async updateOne(filter, update) {
      updates.push({ id: String(filter._id), ...update.$set });
    },
  };
}

const scheduledPost = {
  _id: "post_1",
  userId: "user_1",
  zernioPostId: "zp_1",
  status: CONTENT_STATUS.SCHEDULED,
  accountIds: ["acc_fb", "acc_ig", "acc_li"],
};

test("disconnecting one account cancels the whole scheduled post", async () => {
  const model = createModelStub([scheduledPost]);
  const deleted = [];

  const cancelled = await cancelScheduledPostsForAccount({
    sub: "user_1",
    accountId: "acc_ig",
    reason: DISCONNECTED_ACCOUNT_REASON,
    model,
    deletePost: async (postId) => deleted.push(postId),
  });

  // The Zernio post is removed, so no account receives it.
  assert.deepEqual(deleted, ["zp_1"]);
  assert.deepEqual(cancelled, ["post_1"]);
  assert.equal(model.updates.length, 1);
  assert.equal(model.updates[0].status, CONTENT_STATUS.CANCELLED);
  assert.equal(model.updates[0].statusReason, DISCONNECTED_ACCOUNT_REASON);
  assert.equal(model.updates[0].scheduledAt, null);
});

test("published and draft posts are left alone", async () => {
  const model = createModelStub([
    { ...scheduledPost, _id: "post_published", status: CONTENT_STATUS.PUBLISHED },
    { ...scheduledPost, _id: "post_draft", status: CONTENT_STATUS.DRAFT },
  ]);

  const cancelled = await cancelScheduledPostsForAccount({
    accountId: "acc_ig",
    reason: DISCONNECTED_ACCOUNT_REASON,
    model,
    deletePost: async () => {
      throw new Error("should not be called");
    },
  });

  assert.deepEqual(cancelled, []);
  assert.deepEqual(model.updates, []);
});

test("posts that do not target the account are untouched", async () => {
  const model = createModelStub([
    { ...scheduledPost, _id: "post_other", accountIds: ["acc_fb"] },
  ]);

  const cancelled = await cancelScheduledPostsForAccount({
    accountId: "acc_ig",
    reason: DISCONNECTED_ACCOUNT_REASON,
    model,
    deletePost: async () => {
      throw new Error("should not be called");
    },
  });

  assert.deepEqual(cancelled, []);
});

test("a failed Zernio cancellation marks the post failed instead of leaving it scheduled", async () => {
  const model = createModelStub([scheduledPost]);

  const cancelled = await cancelScheduledPostsForAccount({
    accountId: "acc_ig",
    reason: DISCONNECTED_ACCOUNT_REASON,
    model,
    deletePost: async () => {
      throw new Error("Zernio unavailable");
    },
  });

  assert.deepEqual(cancelled, []);
  assert.equal(model.updates[0].status, CONTENT_STATUS.FAILED);
  assert.match(model.updates[0].statusReason, /Zernio unavailable/);
});

test("every scheduled post targeting the account is cancelled", async () => {
  const model = createModelStub([
    scheduledPost,
    { ...scheduledPost, _id: "post_2", zernioPostId: "zp_2", accountIds: ["acc_ig"] },
  ]);
  const deleted = [];

  const cancelled = await cancelScheduledPostsForAccount({
    accountId: "acc_ig",
    reason: DISCONNECTED_ACCOUNT_REASON,
    model,
    deletePost: async (postId) => deleted.push(postId),
  });

  assert.deepEqual(deleted, ["zp_1", "zp_2"]);
  assert.deepEqual(cancelled, ["post_1", "post_2"]);
});

test("the cascade is scoped to the owner when a user is given", async () => {
  const model = createModelStub([
    { ...scheduledPost, _id: "post_other_user", userId: "user_2" },
  ]);

  const cancelled = await cancelScheduledPostsForAccount({
    sub: "user_1",
    accountId: "acc_ig",
    reason: DISCONNECTED_ACCOUNT_REASON,
    model,
    deletePost: async () => {
      throw new Error("should not be called");
    },
  });

  assert.deepEqual(cancelled, []);
  assert.equal(model.queries[0].userId, "user_1");
});
