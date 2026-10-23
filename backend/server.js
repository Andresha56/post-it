
require("dotenv").config();

const cluster = require("node:cluster");
const os = require("node:os");
const express = require("express");
const cors = require("cors");
const ErrorHandler = require("./middleware/error-handler");
const { ApolloServer } = require("@apollo/server");
const { expressMiddleware } = require("@as-integrations/express5");
const { buildSubgraphSchema } = require("@apollo/subgraph");

const { authenticateUser } = require("./middleware/auth");
const { mergedTypeDefs, mergedResolvers } = require("./api");
const mongoose = require("./config/mongo");

const isProd = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT) || 5000;

async function startServer() {

  // Connect to MongoDB before starting the API.
  await mongoose.connect();

  const app = express();

  app.use(
    cors({
      origin: "*",
    }),
  );
  app.use(express.json());

  // Public health check.
  // app.get("/health", (_req, res) => {
  //   res.status(200).json({
  //     status: "ok",
  //     service: "graphql-api",
  //   });
  // });

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

  // GraphQL context receives the verified Cognito user.
  app.use(
    "/graphql",
    expressMiddleware(server, {
      context: async ({ req }) => ({
        user: await authenticateUser(req),
      }),
    }),
  );

  // Express error-handling middleware.
  app.use(ErrorHandler);

  const httpServer = app.listen(port, () => {
    console.log(`GraphQL API running at http://localhost:${port}/graphql`);
  });

  // Graceful shutdown.
  let shuttingDown = false;

  const shutdown = async (signal) => {
    if (shuttingDown) return;
    shuttingDown = true;

    console.log(`Received ${signal}. Shutting down...`);

    // Force shutdown if connections do not close in time.
    const forceExit = setTimeout(() => {
      console.error("Graceful shutdown timed out");
      process.exit(1);
    }, 10000);

    forceExit.unref();

    try {
      await new Promise((resolve, reject) => {
        httpServer.close((error) => {
          if (error) reject(error);
          else resolve();
        });
      });

      await server.stop();
      await mongoose.disconnect();

      clearTimeout(forceExit);
      console.log("Server shut down successfully");
      process.exit(0);
    } catch (error) {
      console.error("Shutdown error:", error);
      process.exit(1);
    }
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}

/**
 * Cluster only in production.
 */
if (isProd && cluster.isPrimary) {
  const numCPUs = os.availableParallelism
    ? os.availableParallelism()
    : os.cpus().length;

  console.log(`Primary process ${process.pid} forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.error(`Worker ${worker.process.pid} exited`, { code, signal });

    // Replace the failed worker.
    cluster.fork();
  });
} else {
  startServer().catch((error) => {
    console.error("Failed to start server:", error);
    process.exit(1);
  });
}
