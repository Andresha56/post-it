// Zernio quickstart: profile -> connect URL -> accounts -> scheduled post -> status.
// Usage: node scripts/zernio-quickstart.js [platform]   (default: linkedin)
require('dotenv').config();
const readline = require('node:readline/promises');
const { zernio } = require('../config/zernio');

const platform = process.argv[2] || 'linkedin';

async function main() {
    if (!process.env.ZERNIO_API_KEY) {
        throw new Error('ZERNIO_API_KEY is not set');
    }

    // 3. Create a profile
    const { data: profileRes } = await zernio.profiles.createProfile({
        body: { name: 'My first profile' },
    });
    const profileId = profileRes.profile._id;
    console.log('Profile created:', profileId);

    // 4. Get a connect URL and wait for approval
    const { data: connectRes } = await zernio.connect.getConnectUrl({
        path: { platform },
        query: { profileId },
    });
    console.log(`\nOpen this URL and approve access:\n${connectRes.authUrl}\n`);
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await rl.question('Press Enter after approving... ');
    rl.close();

    // 5. List accounts and keep the one just connected
    const { data: accountsRes } = await zernio.accounts.listAccounts();
    const account =
        accountsRes.accounts.find((a) => a.platform === platform && a.profileId?.toString() === profileId) ||
        accountsRes.accounts.find((a) => a.platform === platform);
    if (!account) throw new Error(`No connected ${platform} account found`);
    console.log('Using account:', account._id);

    // 6. Schedule a post one day ahead
    const scheduledFor = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 19);
    const { data: postRes } = await zernio.posts.createPost({
        body: {
            content: 'Hello from the Zernio API.',
            scheduledFor,
            timezone: 'UTC',
            platforms: [{ platform, accountId: account._id }],
        },
    });
    const postId = postRes.post._id;
    console.log('Post scheduled:', postId);

    // 7. Confirm
    const { data: fetched } = await zernio.posts.getPost({ path: { postId } });
    console.log('post.status:', fetched.post.status);
}

main().catch((err) => {
    console.error(err.message || err);
    process.exit(1);
});
