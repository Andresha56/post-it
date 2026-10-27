const generateContent = require("../services/content.service.js");
const {Content} = require("../db/mongo/content.model.js")
const contentResolver = {
  Query: {},
  Mutation: {
    createContent: async (_, { input }, { sub }) => {
      if (!sub) {
        throw new Error("Unauthorized request");
      }

      try {
        const { caption, contentType, title } = input;

        if (!caption?.trim()) {
          throw new Error("Caption prompt is required");
        }

          const generatedCaption = await generateContent(caption);
          
          return ""

        const content = await Content.create({
          userId: sub,
          title,
          caption: generatedCaption,
          contentType,
          status: "DRAFT",
        });

        return {
          success: true,
          message: "Content created successfully",
          content,
        };
      } catch (error) {
        throw new Error(error.message || "Failed to create content");
      }
    },
  },
};

module.exports = contentResolver;
