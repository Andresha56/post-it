
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_CLIENT_ID,
});

async function authenticateUser(req) {
    const authHeader = req.headers.authorization || "";

    if (!authHeader.startsWith("Bearer ")) {
        return null;
    }

    if (
        !process.env.COGNITO_USER_POOL_ID ||
        !process.env.COGNITO_CLIENT_ID
    ) {
        throw new Error("Cognito configuration is missing");
    }

    try {
        const token = authHeader.slice("Bearer ".length);
        const payload = await verifier.verify(token);

        return {
            sub: payload.sub,
            username: payload.username,
        };
    } catch {
        return null;
    }
}

module.exports = { authenticateUser };
