/**
 * Database Configuration
 *
 * Prisma client singleton instance with MariaDB adapter.
 * Prevents multiple instances in development with hot reload.
 */

import { PrismaClient } from "../../generated/prisma/client.js";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { isDev, env } from "./env.ts";
import { logger } from "../lib/logger.ts";

// Declare global type for Prisma client in development
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Create MariaDB adapter with individual connection parameters and pool settings
const createAdapter = () => {
  return new PrismaMariaDb({
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    user: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,
    database: env.DATABASE_NAME,
    // Connection pool configuration
    connectionLimit: 10,
    acquireTimeout: 30000, // 30 seconds to acquire connection
    idleTimeout: 60000, // Close idle connections after 60 seconds
    connectTimeout: 10000, // 10 seconds connection timeout
  });
};

// Log database connection info (not password)
logger.info("Database configuration loaded", {
  host: env.DATABASE_HOST,
  port: env.DATABASE_PORT,
  user: env.DATABASE_USER,
  database: env.DATABASE_NAME,
});

// Create Prisma client with MariaDB adapter
// Prisma 7 requires either adapter or accelerateUrl
const createPrismaClient = () => {
  const adapter = createAdapter();
  
  // Configure Prisma logging based on environment variable
  // Default: In dev, log queries/errors/warnings. In prod, only errors.
  let prismaLog: ("query" | "error" | "warn" | "info")[] = ["error"];
  
  if (env.PRISMA_LOG) {
    if (env.PRISMA_LOG.toLowerCase() === "off") {
      prismaLog = [];
    } else {
      prismaLog = env.PRISMA_LOG.split(",").map((s) => s.trim()) as ("query" | "error" | "warn" | "info")[];
    }
  } else if (isDev) {
    // Default dev behavior: log queries, errors, and warnings
    prismaLog = ["query", "error", "warn"];
  }
  
  return new PrismaClient({
    adapter,
    log: prismaLog,
  });
};

// Use global instance in development to prevent multiple clients with hot reload
export const prisma = globalThis.__prisma ?? createPrismaClient();

if (isDev) {
  globalThis.__prisma = prisma;
}

/**
 * Test database connection
 * Call this on startup to verify database is reachable
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    // Simple query to test connection
    await prisma.$queryRaw`SELECT 1`;
    logger.info("Database connection successful");
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("Database connection failed", {
      error: errorMessage,
      host: env.DATABASE_HOST,
      port: env.DATABASE_PORT,
      database: env.DATABASE_NAME,
    });
    
    // Provide helpful error messages
    if (errorMessage.includes("pool timeout")) {
      logger.error(
        "Pool timeout - check if database server is running and accessible. " +
        "Verify host, port, and credentials are correct."
      );
    } else if (errorMessage.includes("ECONNREFUSED")) {
      logger.error(
        `Connection refused - ensure database server is running on ${env.DATABASE_HOST}:${env.DATABASE_PORT}`
      );
    } else if (errorMessage.includes("Access denied")) {
      logger.error(
        "Access denied - check database username and password are correct"
      );
    }
    
    return false;
  }
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

// Handle SIGTERM
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, closing database connection");
  await prisma.$disconnect();
});

// Handle SIGINT (Ctrl+C)
process.on("SIGINT", async () => {
  logger.info("SIGINT received, closing database connection");
  await prisma.$disconnect();
});
