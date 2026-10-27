const getOrCreateZernioAccount = require("../services/zernio.service");
const { zernio } = require("../../config/zernio");
const User = require("../db/mongo/user.model");
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
        // Find the authenticated user in MongoDB
        const user = await User.findOne({ sub: sub });
        if(!user) {
          throw new Error("User not found");
        }
        if (!user.zernioProfileId) {
          return [];
        }

        // Fetch accounts using the existing Zernio profile
        const { data } = await zernio.accounts.listAccounts({
          query: {
            profileId: user.zernioProfileId,
          },
        });

        const accounts = data.accounts || [];

        return accounts.map((account) => ({
          accountId: account.accountId || account._id,
          platform: account.platform,
          username: account.username || null,
        }));
      } catch (error) {

        throw new Error(error.message);
      }
    },
  },
  Mutation: {
    connectAccount: async (_, { input }, { sub }) => {
      console.log(sub)
      if (!sub) {
        throw new Error("Unauthorized request");
      }

      try {
        const { platform } = input;

        const allowedPlatforms = [
          "linkedin",
          "instagram",
          "facebook",
          "youtube",
          "tiktok",
        ];

        if (!allowedPlatforms.includes(platform)) {
          throw new Error("Unsupported social platform");
        }

        // Get the authenticated user's Zernio profile.
        const zernioProfileId = await getOrCreateZernioAccount(sub);
        // Generate the OAuth connection URL.
        const { data } = await zernio.connect.getConnectUrl({
          path: { platform },
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
    // 1. Find the authenticated user
    const user = await User.findOne({ sub });

    if (!user) {
      throw new Error("User not found");
    }

    // 2. Use the existing Zernio profile; don't create one here
    const zernioProfileId = user.zernioProfileId;

    if (!zernioProfileId) {
      throw new Error("Zernio profile not found");
    }

    // 3. Fetch accounts belonging to this profile
    const { data } = await zernio.accounts.listAccounts({
      query: {
        profileId: zernioProfileId,
      },
    });

    const accounts = data?.accounts || [];

    // 4. Verify that the requested account belongs to this profile
    const account = accounts.find(
      (item) =>
        String(item._id) === accountId ||
        String(item.accountId) === accountId
    );
    if (!account) {
      throw new Error(
        "Account not found or you do not have permission to disconnect it"
      );
    }

    // 5. Disconnect the account using its actual Zernio account ID
    const zernioAccountId = account.accountId || account._id;

    await zernio.accounts.deleteAccount({
      path: {
        accountId: zernioAccountId,
      },
    });

    return {
      success: true,
      message: "Account disconnected successfully",
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
