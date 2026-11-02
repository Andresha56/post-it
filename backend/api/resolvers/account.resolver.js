const getOrCreateZernioAccount = require("../services/zernio.service");
const {
  SUPPORTED_PLATFORMS,
  ZERNIO_PLATFORM_NAMES,
} = require("../constants/socialPlatforms");
const { DISCONNECTED_ACCOUNT_REASON } = require("../constants/contentStatus");
const { zernio } = require("../../config/zernio");
const {
  listConnectedAccounts,
  listProfileAccounts,
} = require("../services/zernioAccounts.service");
const {
  cancelScheduledPostsForAccount,
} = require("../services/zernioPosts.service");

const accountResolvers = {
  Query: {
    getAccount: async (_, { input }, { sub }) => {
      return await sub;
    },
    fetchConnectedAccounts: async (_, __, { sub }) => {
      if (!sub) {
        throw new Error("Unauthorized request");
      }
      try {
        return await listConnectedAccounts(sub);
      } catch (error) {
        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    connectAccount: async (_, { input }, { sub }) => {
      if (!sub) {
        throw new Error("Unauthorized request");
      }

      try {
        const { platform } = input;

        if (!SUPPORTED_PLATFORMS.includes(platform)) {
          throw new Error("Unsupported social platform");
        }

        // Get the authenticated user's Zernio profile.
        const zernioProfileId = await getOrCreateZernioAccount(sub);
        // Generate the OAuth connection URL.
        const { data } = await zernio.connect.getConnectUrl({
          path: { platform: ZERNIO_PLATFORM_NAMES[platform] || platform },
          query: {
            profileId: zernioProfileId,
            scopes: "posting,analytics",
            redirect_url: process.env.ZERNIO_CALLBACK_URL,
            welcome: true,
          },
        });
        return {
          success: true,
          authUrl: data.authUrl,
          message: "Connection URL generated successfully",
        };
      } catch (error) {
        throw new Error(error.message || "Failed to generate connection URL");
      }
    },

    disconnectAccount: async (_, { input }, { sub }) => {
      if (!sub) {
        throw new Error("Unauthorized request");
      }

      const { accountId } = input || {};

      if (!accountId || typeof accountId !== "string") {
        throw new Error("A valid account ID is required");
      }

      try {
        // 1. Read the accounts on this user's own Zernio profile.
        const { zernioProfileId, accounts } = await listProfileAccounts(sub);

        if (!zernioProfileId) {
          throw new Error("Zernio profile not found");
        }

        // 2. Verify that the requested account belongs to this profile.
        const account = accounts.find(
          (item) =>
            String(item._id) === accountId ||
            String(item.accountId) === accountId,
        );

        if (!account) {
          throw new Error(
            "Account not found or you do not have permission to disconnect it",
          );
        }

        // 3. Cancel every scheduled post that targets this account BEFORE the
        //    account is removed, so the whole post is pulled from Zernio while
        //    it can still be deleted. No other selected account receives it.
        const cancelledPostIds = await cancelScheduledPostsForAccount({
          sub,
          accountId,
          reason: DISCONNECTED_ACCOUNT_REASON,
        });

        // 4. Disconnect the account using its actual Zernio account ID.
        const zernioAccountId = account.accountId || account._id;

        await zernio.accounts.deleteAccount({
          path: {
            accountId: zernioAccountId,
          },
        });

        return {
          success: true,
          message:
            cancelledPostIds.length > 0
              ? `Account disconnected. ${cancelledPostIds.length} scheduled post(s) were cancelled.`
              : "Account disconnected successfully",
        };
      } catch (error) {
        console.error("Disconnect account error:", {
          message: error.message,
          statusCode: error.statusCode,
        });

        const expectedErrors = [
          "User not found",
          "Zernio profile not found",
          "Account not found or you do not have permission to disconnect it",
        ];

        if (expectedErrors.includes(error.message)) {
          throw error;
        }

        throw new Error("Failed to disconnect social account");
      }
    },
  },
};

module.exports = accountResolvers;
