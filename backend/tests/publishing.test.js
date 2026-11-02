process.env.ZERNIO_API_KEY = process.env.ZERNIO_API_KEY || "sk_test_dummy";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");

const {
  normalizeConnectedAccounts,
  resolveSelectedAccounts,
  platformsFromAccounts,
  assertFutureSchedule,
  buildZernioPostBody,
  mapPublishResult,
  mapPostEventToUpdate,
} = require("../src/utils/publishing");
const { verifyZernioSignature } = require("../src/utils/webhookSignature");
const { CONTENT_STATUS } = require("../api/constants/contentStatus");
const { SOCIAL_PLATFORMS } = require("../api/constants/socialPlatforms");

const facebook = { accountId: "acc_fb", platform: SOCIAL_PLATFORMS.FACEBOOK };
const instagram = { accountId: "acc_ig", platform: SOCIAL_PLATFORMS.INSTAGRAM };
const linkedin = { accountId: "acc_li", platform: SOCIAL_PLATFORMS.LINKEDIN };

test("only healthy accounts on supported platforms are offered", () => {
  const accounts = normalizeConnectedAccounts([
    { _id: "acc_fb", platform: "facebook", username: "page" },
    { _id: "acc_x", platform: "X", username: "handle" },
    { _id: "acc_ig", platform: "Instagram", isActive: false },
    { _id: "acc_li", platform: "linkedin", needsReconnection: true },
    { _id: "acc_yt", platform: "youtube", enabled: false },
    { _id: "acc_tt", platform: "tiktok" },
  ]);

  assert.deepEqual(accounts, [
    { accountId: "acc_fb", platform: "facebook", username: "page" },
    { accountId: "acc_x", platform: "twitter", username: "handle" },
  ]);
});

test("selection requires at least one connected account", () => {
  assert.throws(
    () => resolveSelectedAccounts({ accountIds: [], connectedAccounts: [facebook] }),
    /at least one connected account/,
  );
});

test("an account that is not connected rejects the whole selection", () => {
  assert.throws(
    () =>
      resolveSelectedAccounts({
        accountIds: ["acc_fb", "acc_ig"],
        connectedAccounts: [facebook],
      }),
    /no longer connected/,
  );
});

test("accounts across platforms and duplicates on one platform are selectable", () => {
  const secondFacebook = { accountId: "acc_fb2", platform: SOCIAL_PLATFORMS.FACEBOOK };

  const selected = resolveSelectedAccounts({
    accountIds: ["acc_fb", "acc_fb2", "acc_ig", "acc_fb"],
    connectedAccounts: [facebook, secondFacebook, instagram],
  });

  assert.deepEqual(
    selected.map((account) => account.accountId),
    ["acc_fb", "acc_fb2", "acc_ig"],
  );
  assert.deepEqual(platformsFromAccounts(selected), ["facebook", "instagram"]);
});

test("a scheduled time must be in the future", () => {
  assert.throws(() => assertFutureSchedule(""), /future scheduled time/);
  assert.throws(() => assertFutureSchedule("not-a-date"), /future scheduled time/);
  assert.throws(
    () => assertFutureSchedule(new Date(Date.now() - 1000).toISOString()),
    /future scheduled time/,
  );

  const future = new Date(Date.now() + 60_000).toISOString();
  assert.equal(assertFutureSchedule(future).toISOString(), future);
});

test("publish now sends every account in one request without scheduledFor", () => {
  const body = buildZernioPostBody({
    title: "Launch",
    caption: "Hello world",
    accounts: [facebook, instagram, linkedin],
    mediaItems: [{ type: "image", url: "https://cdn.test/a.png" }],
    hashtags: ["#launch"],
    publishNow: true,
  });

  assert.deepEqual(body.platforms, [
    { platform: "facebook", accountId: "acc_fb" },
    { platform: "instagram", accountId: "acc_ig" },
    { platform: "linkedin", accountId: "acc_li" },
  ]);
  assert.equal(body.publishNow, true);
  assert.equal(body.scheduledFor, undefined);
  assert.equal(body.content, "Hello world");
  assert.equal(body.mediaItems.length, 1);
});

test("scheduling sends scheduledFor and never publishNow", () => {
  const when = new Date(Date.now() + 3_600_000);
  const body = buildZernioPostBody({
    caption: "Later",
    accounts: [facebook],
    publishNow: false,
    scheduledFor: when,
  });

  assert.equal(body.publishNow, undefined);
  assert.equal(body.scheduledFor, when.toISOString());
});

test("a fully published response is stored as published", () => {
  const result = mapPublishResult({
    publishNow: true,
    requestedAccounts: [facebook, instagram],
    response: {
      post: {
        _id: "zp_1",
        status: "published",
        platforms: [
          {
            accountId: "acc_fb",
            platform: "facebook",
            status: "published",
            platformPostId: "fb_1",
            publishedAt: "2026-07-01T10:00:00.000Z",
          },
          { accountId: "acc_ig", platform: "instagram", status: "published" },
        ],
      },
    },
  });

  assert.equal(result.zernioPostId, "zp_1");
  assert.equal(result.status, CONTENT_STATUS.PUBLISHED);
  assert.equal(result.statusReason, null);
  assert.equal(result.accountResults.length, 2);
  assert.equal(result.accountResults[0].platformPostId, "fb_1");
});

test("a partial publish keeps the failed account on the record", () => {
  const result = mapPublishResult({
    publishNow: true,
    requestedAccounts: [facebook, instagram],
    response: {
      post: {
        _id: "zp_2",
        status: "partial",
        platforms: [
          { accountId: "acc_fb", platform: "facebook", status: "published" },
          {
            accountId: "acc_ig",
            platform: "instagram",
            status: "failed",
            error: "Media rejected",
          },
        ],
      },
    },
  });

  assert.equal(result.status, CONTENT_STATUS.PUBLISHED);
  assert.match(result.statusReason, /instagram/);
  assert.match(result.statusReason, /Media rejected/);
  assert.equal(
    result.accountResults.find((item) => item.accountId === "acc_ig").status,
    "failed",
  );
});

test("a failed publish is never stored as published", () => {
  const result = mapPublishResult({
    publishNow: true,
    requestedAccounts: [facebook],
    response: {
      post: {
        _id: "zp_3",
        status: "failed",
        platforms: [
          { accountId: "acc_fb", platform: "facebook", status: "failed", error: "Token expired" },
        ],
      },
      error: "No platform published",
    },
  });

  assert.equal(result.status, CONTENT_STATUS.FAILED);
  assert.equal(result.publishedAt, null);
});

test("a scheduled response is stored as scheduled", () => {
  const result = mapPublishResult({
    publishNow: false,
    requestedAccounts: [facebook],
    response: {
      post: {
        _id: "zp_4",
        status: "scheduled",
        platforms: [{ accountId: "acc_fb", platform: "facebook", status: "pending" }],
      },
    },
  });

  assert.equal(result.status, CONTENT_STATUS.SCHEDULED);
  assert.equal(result.publishedAt, null);
});

test("a response without a post ID is rejected", () => {
  assert.throws(
    () =>
      mapPublishResult({
        publishNow: true,
        requestedAccounts: [facebook],
        response: { post: { status: "published" } },
      }),
    /post ID/,
  );
});

test("post webhooks update the stored status", () => {
  const published = mapPostEventToUpdate({
    id: "zp_5",
    status: "published",
    publishedAt: "2026-07-01T10:00:00.000Z",
    platforms: [
      {
        accountId: "acc_fb",
        platform: "facebook",
        status: "published",
        publishedUrl: "https://fb.test/1",
      },
    ],
  });

  assert.equal(published.status, CONTENT_STATUS.PUBLISHED);
  assert.equal(published.accountResults[0].platformPostUrl, "https://fb.test/1");

  const failed = mapPostEventToUpdate({
    id: "zp_6",
    status: "failed",
    platforms: [
      { accountId: "acc_ig", platform: "instagram", status: "failed", error: "Rejected" },
    ],
  });

  assert.equal(failed.status, CONTENT_STATUS.FAILED);
  assert.match(failed.statusReason, /instagram/);
});

test("webhook signatures are verified against the raw body", () => {
  const secret = "whsec_test";
  const rawBody = Buffer.from(JSON.stringify({ id: "evt_1", event: "post.published" }));
  const signature = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");

  assert.equal(verifyZernioSignature({ rawBody, signature, secret }), true);
  assert.equal(
    verifyZernioSignature({ rawBody, signature: signature.replace(/.$/, "0"), secret }),
    false,
  );
  assert.equal(
    verifyZernioSignature({ rawBody, signature, secret: "whsec_other" }),
    false,
  );
  assert.equal(
    verifyZernioSignature({
      rawBody: Buffer.from(JSON.stringify({ id: "evt_1", event: "post.failed" })),
      signature,
      secret,
    }),
    false,
  );
  assert.equal(verifyZernioSignature({ rawBody, signature: null, secret }), false);
});
