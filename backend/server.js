
require("dotenv").config();

const cluster = require("node:cluster");
const os = require("node:os");
const express = require("express");
const cors = require("cors");

const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const { buildSubgraphSchema } = require("@apollo/subgraph");

const { mergedTypeDefs, mergedResolvers } = require("./resolver");
const mongoose = require("./config/mongo");

const isProd = process.env.NODE_ENV === "production";
const port = process.env.PORT || 5000;

async function startServer() {
    // Connect to MongoDB before starting the API.
    await mongoose.connect();

    const app = express();

    app.use(cors());
    app.use(express.json());

    // Initialize Apollo Server with the federated subgraph schema.
    const server = new ApolloServer({
        schema: buildSubgraphSchema([
            {
                typeDefs: mergedTypeDefs,
                resolvers: mergedResolvers,
            },
        ]),
    });

    await server.start();

    // Mount the GraphQL endpoint.
    app.use(
        "/graphql",
        expressMiddleware(server),
    );

    // Health-check endpoint.
    app.get("/health", (_req, res) => {
        res.status(200).json({
            status: "ok",
            service: "graphql-api",
        });
    });

    // Express error-handling middleware.
    app.use((err, req, res, next) => {
        console.error("Express error:", err);

        if (res.headersSent) {
            return next(err);
        }

        res.status(500).json({
            message: "Internal server error",
        });
    });

    const httpServer = app.listen(port, () => {
        console.log(
            `Server running at http://localhost:${port}/graphql`,
        );
    });

    // Graceful shutdown.
    let shuttingDown = false;

    const shutdown = async () => {
        if (shuttingDown) return;
        shuttingDown = true;

        console.log("Shutting down server...");

        httpServer.close(async () => {
            try {
                await server.stop();
                await mongoose.disconnect();

                console.log("Server shut down successfully");
                process.exit(0);
            } catch (error) {
                console.error("Shutdown error:", error);
                process.exit(1);
            }
        });
    };

    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
}

/**
 * Cluster only in production.
 */
if (isProd && cluster.isPrimary) {
    const numCPUs = os.availableParallelism
        ? os.availableParallelism()
        : os.cpus().length;

    console.log(
        `Primary process ${process.pid} forking ${numCPUs} workers`,
    );

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on("exit", (worker, code, signal) => {
        console.error(
            `Worker ${worker.process.pid} exited`,
            { code, signal },
        );

        if (!cluster.isPrimary) return;

        cluster.fork();
    });
} else {
    startServer().catch((error) => {
        console.error("Failed to start server:", error);
        process.exit(1);
    });
}
