process.env.ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || "sk_test_dummy";

const test = require("node:test");
const assert = require("node:assert/strict");

const { CONTENT_STATUS } = require("../api/constants/contentStatus");
const { SOCIAL_PLATFORMS } = require("../api/constants/socialPlatforms");

// Replace the Zernio-backed services with stubs before the resolver loads
// them, so the whole createContent flow can be exercised without the network.
const calls = {};

const handlers = {
  getSelectedAccounts: async () => [],
  buildMediaItems: async () => [],
  submitPost: async () => ({}),
  create: async (document) => document,
  find: () => [],
  revalidateScheduledPosts: async ({ posts }) => posts,
};

function stubModule(modulePath, exports) {
  const filename = require.resolve(modulePath);

  require.cache[filename] = {
    id: filename,
    filename,
    loaded: true,
    exports,
  };
}

stubModule("../api/services/zernioAccounts.service.js", {
  getSelectedAccounts: (...args) => {
    calls.getSelectedAccounts = args;
    return handlers.getSelectedAccounts(...args);
  },
});

stubModule("../api/services/zernioMedia.service.js", {
  buildMediaItems: (...args) => {
    calls.buildMediaItems = args;
    return handlers.buildMediaItems(...args);
  },
});

stubModule("../api/services/zernioPosts.service.js", {
  submitPost: (...args) => {
    calls.submitPost = args;
    return handlers.submitPost(...args);
  },
  revalidateScheduledPosts: (...args) => {
    calls.revalidateScheduledPosts = args;
    return handlers.revalidateScheduledPosts(...args);
  },
});

stubModule("../api/db/mongo/content.model.js", {
  create: (...args) => {
    calls.create = args;
    return handlers.create(...args);
  },
  find: () => ({
    sort: () => ({
      skip: () => ({
        limit: async () => handlers.find(),
      }),
    }),
  }),
  countDocuments: async () => handlers.find().length,
});

const contentResolver = require("../api/resolvers/content.resolver.js");

const createContent = (input, sub = "user_1") =>
  contentResolver.Mutation.createContent(null, { input }, { sub });

const facebook = { accountId: "acc_fb", platform: SOCIAL_PLATFORMS.FACEBOOK };
const instagram = { accountId: "acc_ig", platform: SOCIAL_PLATFORMS.INSTAGRAM };
const linkedin = { accountId: "acc_li", platform: SOCIAL_PLATFORMS.LINKEDIN };

const baseInput = {
  title: "Launch day",
  caption: "We are live",
  contentType: "TEXT",
  mediaUrls: [],
  hashtags: "#launch",
};

test.beforeEach(() => {
  for (const key of Object.keys(calls)) delete calls[key];

  handlers.getSelectedAccounts = async () => [];
  handlers.buildMediaItems = async () => [];
  handlers.submitPost = async () => ({});
  handlers.create = async (document) => ({ id: "content_1", ...document });
  handlers.find = () => [];
  handlers.revalidateScheduledPosts = async ({ posts }) => posts;
});

test("an unauthenticated request cannot create content", async () => {
  await assert.rejects(
    contentResolver.Mutation.createContent(null, { input: baseInput }, {}),
    /Unauthorized request/,
  );
});

test("publishing without a connected account is refused and nothing is stored", async () => {
  handlers.getSelectedAccounts = async () => {
    throw new Error(
      "Connect at least one social account before publishing or scheduling",
    );
  };

  await assert.rejects(
    createContent({
      ...baseInput,
      status: CONTENT_STATUS.PUBLISHED,
      accountIds: [],
    }),
    /Connect at least one social account/,
  );

  assert.equal(calls.submitPost, undefined);
  assert.equal(calls.create, undefined);
});

test("publish now sends one request covering every selected account", async () => {
  handlers.getSelectedAccounts = async () => [facebook, instagram, linkedin];
  handlers.submitPost = async () => ({
    zernioPostId: "zp_1",
    status: CONTENT_STATUS.PUBLISHED,
    statusReason: null,
    accountResults: [
      { accountId: "acc_fb", platform: "facebook", status: "published" },
      { accountId: "acc_ig", platform: "instagram", status: "published" },
      { accountId: "acc_li", platform: "linkedin", status: "published" },
    ],
    publishedAt: new Date("2026-07-01T10:00:00.000Z"),
  });

  const result = await createContent({
    ...baseInput,
    status: CONTENT_STATUS.PUBLISHED,
    accountIds: ["acc_fb", "acc_ig", "acc_li"],
  });

  assert.equal(result.success, true);

  const [{ accounts, publishNow }] = calls.submitPost;
  assert.deepEqual(
    accounts.map((account) => account.accountId),
    ["acc_fb", "acc_ig", "acc_li"],
  );
  assert.equal(publishNow, true);

  const [document] = calls.create;
  assert.equal(document.status, CONTENT_STATUS.PUBLISHED);
  assert.equal(document.zernioPostId, "zp_1");
  assert.deepEqual(document.accountIds, ["acc_fb", "acc_ig", "acc_li"]);
  // Platforms are derived from the accounts, never sent by the client.
  assert.deepEqual(document.platforms, ["facebook", "instagram", "linkedin"]);
  assert.deepEqual(document.hashtags, ["#launch"]);
});

test("two accounts on one platform store that platform once", async () => {
  handlers.getSelectedAccounts = async () => [
    facebook,
    { accountId: "acc_fb2", platform: SOCIAL_PLATFORMS.FACEBOOK },
  ];
  handlers.submitPost = async () => ({
    zernioPostId: "zp_2",
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [],
    publishedAt: null,
  });

  await createContent({
    ...baseInput,
    status: CONTENT_STATUS.PUBLISHED,
    accountIds: ["acc_fb", "acc_fb2"],
  });

  const [document] = calls.create;
  assert.deepEqual(document.platforms, ["facebook"]);
  assert.deepEqual(document.accountIds, ["acc_fb", "acc_fb2"]);
});

test("a single connected account can publish", async () => {
  handlers.getSelectedAccounts = async () => [facebook];
  handlers.submitPost = async () => ({
    zernioPostId: "zp_3",
    status: CONTENT_STATUS.PUBLISHED,
    accountResults: [],
    publishedAt: null,
  });

  const result = await createContent({
    ...baseInput,
    status: CONTENT_STATUS.PUBLISHED,
    accountIds: ["acc_fb"],
  });

  assert.equal(result.success, true);
  assert.equal(calls.create[0].zernioPostId, "zp_3");
});

test("scheduling submits a future time to Zernio and stores it", async () => {
  const scheduledAt = new Date(Date.now() + 3_600_000).toISOString();

  handlers.getSelectedAccounts = async () => [facebook, instagram];
  handlers.submitPost = async () => ({
    zernioPostId: "zp_4",
    status: CONTENT_STATUS.SCHEDULED,
    accountResults: [],
    publishedAt: null,
  });

  await createContent({
    ...baseInput,
    status: CONTENT_STATUS.SCHEDULED,
    scheduledAt,
    accountIds: ["acc_fb", "acc_ig"],
  });

  const [submitted] = calls.submitPost;
  assert.equal(submitted.publishNow, false);
  assert.equal(new Date(submitted.scheduledFor).toISOString(), scheduledAt);

  const [document] = calls.create;
  assert.equal(document.status, CONTENT_STATUS.SCHEDULED);
  assert.equal(document.scheduledAt.toISOString(), scheduledAt);
  assert.equal(document.publishedAt, null);
});

test("a scheduled time in the past never reaches Zernio", async () => {
  handlers.getSelectedAccounts = async () => [facebook];

  await assert.rejects(
    createContent({
      ...baseInput,
      status: CONTENT_STATUS.SCHEDULED,
      scheduledAt: new Date(Date.now() - 1000).toISOString(),
      accountIds: ["acc_fb"],
    }),
    /future scheduled time/,
  );

  assert.equal(calls.submitPost, undefined);
  assert.equal(calls.create, undefined);
});

test("a draft is stored without any account and never reaches Zernio", async () => {
  const result = await createContent({
    ...baseInput,
    status: CONTENT_STATUS.DRAFT,
    accountIds: [],
  });

  assert.equal(result.success, true);
  assert.equal(calls.getSelectedAccounts, undefined);
  assert.equal(calls.submitPost, undefined);
  assert.equal(calls.create[0].status, CONTENT_STATUS.DRAFT);
  assert.deepEqual(calls.create[0].platforms, []);
});

test("a failed media upload blocks publishing", async () => {
  handlers.getSelectedAccounts = async () => [facebook];
  handlers.buildMediaItems = async () => {
    throw new Error("Media upload failed (500)");
  };

  await assert.rejects(
    createContent({
      ...baseInput,
      contentType: "IMAGE",
      mediaUrls: [
        "users/user_1/media/123e4567-e89b-12d3-a456-426614174000.png",
      ],
      status: CONTENT_STATUS.PUBLISHED,
      accountIds: ["acc_fb"],
    }),
    /Media upload failed/,
  );

  assert.equal(calls.submitPost, undefined);
  assert.equal(calls.create, undefined);
});

test("media is uploaded before the post is submitted", async () => {
  const order = [];

  handlers.getSelectedAccounts = async () => [facebook];
  handlers.buildMediaItems = async () => {
    order.push("media");
    return [{ type: "image", url: "https://cdn.test/a.png" }];
  };
  handlers.submitPost = async () => {
    order.push("submit");
    return {
      zernioPostId: "zp_5",
      status: CONTENT_STATUS.PUBLISHED,
      accountResults: [],
      publishedAt: null,
    };
  };

  await createContent({
    ...baseInput,
    contentType: "IMAGE",
    mediaUrls: ["users/user_1/media/123e4567-e89b-12d3-a456-426614174000.png"],
    status: CONTENT_STATUS.PUBLISHED,
    accountIds: ["acc_fb"],
  });

  assert.deepEqual(order, ["media", "submit"]);
  assert.deepEqual(calls.submitPost[0].mediaItems, [
    { type: "image", url: "https://cdn.test/a.png" },
  ]);
});

test("the stored status comes from Zernio, not from the request", async () => {
  handlers.getSelectedAccounts = async () => [facebook];
  handlers.submitPost = async () => ({
    zernioPostId: "zp_6",
    status: CONTENT_STATUS.FAILED,
    statusReason: "Failed on facebook: Token expired",
    accountResults: [
      { accountId: "acc_fb", platform: "facebook", status: "failed" },
    ],
    publishedAt: null,
  });

  await createContent({
    ...baseInput,
    status: CONTENT_STATUS.PUBLISHED,
    accountIds: ["acc_fb"],
  });

  const [document] = calls.create;
  assert.equal(document.status, CONTENT_STATUS.FAILED);
  assert.match(document.statusReason, /Token expired/);
  assert.equal(document.publishedAt, null);
});

test("a client cannot create content in a workflow-only status", async () => {
  for (const status of [CONTENT_STATUS.PUBLISHING, CONTENT_STATUS.CANCELLED, CONTENT_STATUS.FAILED]) {
    await assert.rejects(
      createContent({ ...baseInput, status, accountIds: ["acc_fb"] }),
      /draft, scheduled or published/,
    );
  }

  assert.equal(calls.create, undefined);
});

test("another user's media key is rejected", async () => {  handlers.getSelectedAccounts = async () => [facebook];

  await assert.rejects(
    createContent({
      ...baseInput,
      contentType: "IMAGE",
      mediaUrls: [
        "users/user_2/media/123e4567-e89b-12d3-a456-426614174000.png",
      ],
      status: CONTENT_STATUS.PUBLISHED,
      accountIds: ["acc_fb"],
    }),
    /Invalid media reference/,
  );

  assert.equal(calls.create, undefined);
});

test("reading content re-checks scheduled posts for disconnected accounts", async () => {
  const scheduled = {
    _id: "post_1",
    status: CONTENT_STATUS.SCHEDULED,
    accountIds: ["acc_fb", "acc_ig"],
  };

  handlers.find = () => [scheduled];
  handlers.revalidateScheduledPosts = async ({ posts, reason, sub }) => {
    // Simulate the guard cancelling the post because acc_ig is gone.
    assert.equal(sub, "user_1");
    assert.match(reason, /disconnected before publishing/);

    return posts.map((post) => ({
      ...post,
      status: CONTENT_STATUS.CANCELLED,
      statusReason: reason,
    }));
  };

  const result = await contentResolver.Query.getContents(
    null,
    { page: 1, limit: 20 },
    { sub: "user_1" },
  );

  assert.equal(result.success, true);
  assert.equal(result.contents[0].status, CONTENT_STATUS.CANCELLED);
  assert.ok(calls.revalidateScheduledPosts);
});
