const { zernio } = require("../../config/zernio");
const User = require("../db/mongo/user.model");
const mongoose = require("mongoose");

const findZernioProfile = async (sub) => {
  const result = await zernio.profiles.listProfiles({
    query: { externalId: sub },
  });

  return result?.data?.profiles?.find(
    (profile) => profile.externalId === sub,
  );
};

const getOrCreateZernioAccount = async (sub) => {
  const user = await User.findOne({ sub: sub });
  console.log("Connected database:", mongoose.connection.name);
console.log("Connected host:", mongoose.connection.host);
  if (!user) {
    throw new Error("User not found in MongoDB");
  }

  // 1. Reuse the profile already mapped to this user.
  if (user.zernioProfileId) {
    return user.zernioProfileId;
  }

  let profile;

  // 2. Try to recover a profile created by an earlier request.
  profile = await findZernioProfile(sub);

  // 3. Create a profile only if one doesn't already exist.
  if (!profile) {
    try {
      const result = await zernio.profiles.createProfile({
        body: {
          name: `customer_${sub}`,
          externalId: sub,
          description: "Customer social media profile",
        },
      });

      profile = result?.data?.profile;
    } catch (createError) {
      // Another concurrent request may have created it,
      // or a previous request may have timed out.
      try {
        profile = await findZernioProfile(sub);
      } catch {
        // Preserve the original creation error.
        throw createError;
      }

      if (!profile) {
        throw createError;
      }
    }
  }

  const profileId = profile?._id;

  if (!profileId) {
    throw new Error("Zernio profile ID was not returned");
  }

  // 4. Save the mapping to MongoDB.
  await User.updateOne(
    { sub: sub },
    { $set: { zernioProfileId: profileId } },
  );

  return profileId;
};

module.exports = getOrCreateZernioAccount;