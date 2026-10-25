const getOrCreateZernioAccount = require("../services/zernio.service");
const { zernio } = require("../../config/zernio");

const accountResolvers = {
  Query: {
    getAccount: async (_, { input }, { sub }) => {
      return await sub;
    },
  },
  Mutation: {
  connectAccount: async (_, { input }, { sub }) => {
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
          redirect_url: process.env.ZERNIO_CALLBACK_URL,
        },
      });
      console.log("data:", data);

      return {
        success: true,
        authUrl: data.authUrl,
        message: "Connection URL generated successfully",
      };
    } catch (error) {
      throw new Error(error.message || "Failed to generate connection URL");
    }
  },
},
};

module.exports = accountResolvers;
