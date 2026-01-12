/**
 * CORS Configuration
 *
 * Configures Cross-Origin Resource Sharing for the API.
 * Allows requests from the frontend URL with credentials.
 */

import type { CorsOptions } from "cors";
import { env, isDev } from "./env.ts";

export const corsOptions: CorsOptions = {
  // Allow requests from frontend
  origin: isDev
    ? [env.FRONTEND_URL, "http://localhost:3000", "http://127.0.0.1:3000"]
    : env.FRONTEND_URL,

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Allowed HTTP methods
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

  // Allowed headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-Request-Id",
  ],

  // Headers exposed to the client
  exposedHeaders: ["Set-Cookie", "X-Request-Id"],

  // Preflight cache duration (in seconds)
  maxAge: 86400, // 24 hours

  // Pass preflight response to next handler
  preflightContinue: false,

  // Return 204 for successful OPTIONS requests
  optionsSuccessStatus: 204,
};
