
const { CognitoJwtVerifier } = require("aws-jwt-verify");

const verifier = CognitoJwtVerifier.create({
    userPoolId: process.env.COGNITO_USER_POOL_ID,
    tokenUse: "access",
    clientId: process.env.COGNITO_CLIENT_ID,
});

async function authenticateUser(req) {
    try {
        const authHeader = req.headers.authorization || "";
        if (!authHeader) {
            throw new Error("Unauthorized request");
        }
        if (!authHeader.startsWith("Bearer ")) {
            throw new Error("Unauthorized request");
        }

        if (
            !process.env.COGNITO_USER_POOL_ID ||
            !process.env.COGNITO_CLIENT_ID
        ) {
            throw new Error("Unauthorized request");
        }


        const token = authHeader.slice("Bearer ".length);
        const payload = await verifier.verify(token);
        return {
            sub: payload.sub,
            username: payload.username,
        };
    } catch (error) {
        throw error;
    }
}

module.exports = { authenticateUser };
