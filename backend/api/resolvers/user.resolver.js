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
  console.log("Creating user with input:", input, "and sub:", sub);
  try {
    return await User.findOneAndUpdate(
      { sub: sub },
      {
        $set: {
          name: input.name,
          email: input.email,
        },
        $setOnInsert: {
          sub: sub,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    console.error("Create user error:", error);
    throw new Error(error.message || "Failed to create user");
  }
},
  },
};

module.exports = userResolvers;
