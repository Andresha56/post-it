const createApolloContext = async ({ req }) => {
    // Extract the user from the request headers (e.g., using a token).
    const token = req.headers.authorization || "";
    if (!token) {
        throw new Error("No authorization token provided");
    }
    if (token.startsWith("Bearer ")) {
        const tokenValue = token.split(" ")[1];
        
    }
}