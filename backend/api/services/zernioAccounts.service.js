const { zernio } = require("../../config/zernio");
const User = require("../db/mongo/user.model");
const {
    normalizeConnectedAccounts,
    resolveSelectedAccounts,
} = require("../../src/utils/publishing");

/**
 * Reads the authenticated user's social accounts from Zernio. The Zernio
 * profile is the ownership boundary: only accounts under the user's own
 * profile are ever returned, so an account ID posted by a client cannot
 * reach another user's account.
 */
async function getZernioProfileId(sub) {
    const user = await User.findOne({ sub });

    if (!user) {
        throw new Error("User not found");
    }

    return user.zernioProfileId || null;
}

// Raw Zernio accounts for the user's profile (connected or not).
async function listProfileAccounts(sub) {
    const zernioProfileId = await getZernioProfileId(sub);

    if (!zernioProfileId) return { zernioProfileId: null, accounts: [] };

    const { data } = await zernio.accounts.listAccounts({
        query: { profileId: zernioProfileId },
    });

    return { zernioProfileId, accounts: data?.accounts ?? [] };
}

// Only the accounts that can actually be published to right now.
async function listConnectedAccounts(sub) {
    const { accounts } = await listProfileAccounts(sub);

    return normalizeConnectedAccounts(accounts);
}

/**
 * Validate the account IDs a client selected. Throws when any of them is
 * unknown, owned by someone else, or no longer connected.
 */
async function getSelectedAccounts(sub, accountIds) {
    const connectedAccounts = await listConnectedAccounts(sub);

    if (connectedAccounts.length === 0) {
        throw new Error(
            "Connect at least one social account before publishing or scheduling",
        );
    }

    return resolveSelectedAccounts({ accountIds, connectedAccounts });
}

module.exports = {
    getZernioProfileId,
    listProfileAccounts,
    listConnectedAccounts,
    getSelectedAccounts,
};
