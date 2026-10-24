const User = require("../db/mongo/user.model");

const userResolvers = {
  Query: {
    getUser: async (_, { userId }, { sub }) => {
      if (!sub) {
        throw new Error("Unauthorized request");
      }

      const account = await User.findById({ sub, _id: userId });
      if (!account) {
        throw new Error("User not found");
      }

      return account;
    },
  },
  Mutation: {
    createUser: async (_, { input }, { sub }) => {
      if (!sub) {
        throw new Error("Unauthorized request");
      }

      // A Cognito subject is required by the User model and identifies the
      // authenticated user. Reuse the existing record on repeated requests.
      return User.findOneAndUpdate(
        { cognitoSub: sub },
        {
          $set: {
            name: input.name,
            email: input.email,
            ...(input.zernioProfileId !== undefined && {
              zernioProfileId: input.zernioProfileId,
            }),
          },
          $setOnInsert: { cognitoSub: sub },
        },
        { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
      );
    },
  },
};

module.exports = userResolvers;
