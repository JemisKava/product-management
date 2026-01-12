/**
 * Server Entry Point
 *
 * Starts the Express server with tRPC.
 *
 * Run with: bun --watch src/index.ts
 */

import app from "./app.ts";
import { env } from "./config/env.ts";
import { prisma, testDatabaseConnection } from "./config/database.ts";
import { logger } from "./lib/logger.ts";

// ============================================
// START SERVER
// ============================================

async function main() {
  // Test database connection with helpful error messages
  const isConnected = await testDatabaseConnection();
  if (!isConnected) {
    logger.error("Failed to connect to database. Server cannot start.");
    process.exit(1);
  }

  // Start server
  app.listen(env.PORT, () => {
    const baseUrl = `http://localhost:${env.PORT}`;
    logger.info("Server started", {
      port: env.PORT,
      healthUrl: `${baseUrl}/health`,
      trpcUrl: `${baseUrl}/trpc`,
      uploadsUrl: `${baseUrl}/uploads`,
      frontendUrl: env.FRONTEND_URL,
    });
  });
}

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

process.on("SIGINT", async () => {
  logger.info("Shutting down (SIGINT)");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Shutting down (SIGTERM)");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (reason) => {
  const err = reason instanceof Error ? reason : new Error(String(reason));
  logger.error("Unhandled promise rejection", {
    errorMessage: err.message,
    stack: err.stack,
  });
});

process.on("uncaughtException", (error) => {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error("Uncaught exception", {
    errorMessage: err.message,
    stack: err.stack,
  });
  void prisma.$disconnect().finally(() => process.exit(1));
});

// ============================================
// RUN
// ============================================

main().catch((error) => {
  const err = error instanceof Error ? error : new Error(String(error));
  logger.error("Failed to start server", {
    errorMessage: err.message,
    stack: err.stack,
  });
  process.exit(1);
});
