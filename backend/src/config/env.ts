/**
 * Environment Configuration
 *
 * Uses Zod for validation and type safety.
 * Bun automatically loads .env files, but we ensure it's loaded.
 */

import { z } from "zod";

// Ensure .env is loaded (Bun does this automatically, but explicit for clarity)
if (typeof process !== "undefined" && process.env) {
  // Bun automatically loads .env, but we can verify
}

// Helper function to parse DATABASE_URL and extract components
function parseDatabaseUrl(url: string | undefined) {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parsed.port || "3306",
      user: parsed.username,
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.slice(1), // Remove leading slash
    };
  } catch {
    return null;
  }
}

// Parse DATABASE_URL if it exists to populate individual variables
const dbUrlParts = parseDatabaseUrl(process.env.DATABASE_URL);

// Environment schema with validation
const envSchema = z.object({
  // Database - Using individual variables for MariaDB adapter
  // If DATABASE_URL is set, extract components; otherwise require individual vars
  DATABASE_HOST: z
    .string()
    .min(1, "DATABASE_HOST is required")
    .default(dbUrlParts?.host || "localhost"),
  DATABASE_PORT: z
    .string()
    .default(dbUrlParts?.port || "3306")
    .transform(Number)
    .pipe(z.number().positive()),
  DATABASE_USER: z
    .string()
    .min(1, "DATABASE_USER is required")
    .default(dbUrlParts?.user || ""),
  DATABASE_PASSWORD: z
    .string()
    .min(1, "DATABASE_PASSWORD is required")
    .default(dbUrlParts?.password || ""),
  DATABASE_NAME: z
    .string()
    .min(1, "DATABASE_NAME is required")
    .default(dbUrlParts?.database || ""),
  
  // Legacy DATABASE_URL (optional, can be used for migrations/config)
  DATABASE_URL: z.string().optional(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  JWT_ACCESS_EXPIRES: z.string().default("15m"),
  JWT_REFRESH_EXPIRES: z.string().default("7d"),

  // Server
  PORT: z
    .string()
    .default("5000")
    .transform(Number)
    .pipe(z.number().positive()),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Frontend URL (for CORS)
  FRONTEND_URL: z.string().url().default("http://localhost:3000"),

  // Logging
  LOG_LEVEL: z
    .enum(["error", "warn", "info", "http", "verbose", "debug", "silly"])
    .optional(),
  LOG_DIR: z.string().optional(),
  SERVICE_NAME: z.string().optional(),
  
  // Prisma Logging (controls SQL query logging)
  // Options: "query" | "error" | "warn" | "info" | "query,error" | "query,error,warn" | "off"
  // Set to "off" to disable all Prisma logs, or comma-separated list for specific log types
  PRISMA_LOG: z.string().optional(),
});

// Parse and validate environment variables
const parseEnv = () => {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.flatten().fieldErrors);
    process.exit(1);
  }

  const data = result.data;

  const normalizedLogDir = data.LOG_DIR?.trim();

  return {
    ...data,
    LOG_LEVEL: data.LOG_LEVEL ?? (data.NODE_ENV === "development" ? "debug" : "info"),
    LOG_DIR:
      normalizedLogDir && normalizedLogDir.length > 0
        ? normalizedLogDir
        : data.NODE_ENV === "production"
          ? "logs"
          : undefined,
    SERVICE_NAME: data.SERVICE_NAME ?? "product-management-backend",
  };
};

// Export validated config
export const env = parseEnv();

// Type for the environment
export type Env = ReturnType<typeof parseEnv>;

// Helper to check if we're in production
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
export const isTest = env.NODE_ENV === "test";
