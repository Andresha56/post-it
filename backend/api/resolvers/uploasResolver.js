const { GraphQLError } = require("graphql");
const { generatePresignedUrl } = require("../../src/utils/s3Upload");

const uploadResolvers = {
  Mutation: {
    createUploadUrl: async (_, { input }, { sub }) => {
      if (!sub) {
        throw new GraphQLError("Authentication required", {
          extensions: { code: "UNAUTHENTICATED" },
        });
      }

      try {
        return await generatePresignedUrl({
          userId: sub,
          contentType: input.contentType,
          fileSize: input.fileSize,
        });
      } catch (error) {
        if (
          error.message === "Unsupported file type" ||
          error.message.startsWith("File size")
        ) {
          throw new GraphQLError(error.message, {
            extensions: { code: "BAD_USER_INPUT" },
          });
        }

        console.error("Presigned URL generation failed:", error.message);

        throw new GraphQLError("Could not create upload URL", {
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        });
      }
    },
  },
};

module.exports = uploadResolvers;