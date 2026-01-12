/**
 * Express Application
 *
 * Main Express app with tRPC integration.
 */

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import * as trpcExpress from "@trpc/server/adapters/express";
import { corsOptions } from "./config/cors.ts";
import { appRouter } from "./routers/index.ts";
import { createContext } from "./routers/context.ts";
import { errorHandler, notFoundHandler } from "./middleware/error.ts";
import { uploadProductImage } from "./middleware/upload.ts";
import { requireAnyPermission } from "./middleware/require-permission.ts";
import { env } from "./config/env.ts";
import { requestIdMiddleware } from "./middleware/request-id.ts";
import { requestLogger } from "./middleware/request-logger.ts";
import { logger } from "./lib/logger.ts";

// ============================================
// CREATE EXPRESS APP
// ============================================

const app = express();

// ============================================
// MIDDLEWARE
// ============================================

// Request ID + logging
app.use(requestIdMiddleware);
app.use(requestLogger);

// CORS
app.use(cors(corsOptions));

// Parse JSON
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Parse cookies
app.use(cookieParser());

// Serve static files (uploaded images)
app.use("/uploads", express.static("uploads"));

// ============================================
// HEALTH CHECK
// ============================================

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ============================================
// FILE UPLOAD ENDPOINT
// ============================================

app.post(
  "/api/upload",
  requireAnyPermission(["PRODUCT_CREATE", "PRODUCT_EDIT"]),
  uploadProductImage,
  (req, res) => {
    // Handle multer errors
    if (req.file === undefined) {
      return res.status(400).json({
        success: false,
        error: { code: "NO_FILE", message: "No file uploaded" },
      });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    return res.json({
      success: true,
      data: { imageUrl },
    });
  }
);

// ============================================
// tRPC HANDLER
// ============================================

// Handle root /trpc path with helpful information
app.get("/trpc", (_req, res) => {
  res.json({
    message: "tRPC API is running",
    version: "1.0.0",
    routers: {
      auth: "Authentication operations (login, logout, refresh, me)",
      user: "User management operations",
      product: "Product management operations",
      category: "Category management operations",
    },
    note: "Use the tRPC client or POST to /trpc/{router.procedure} to call procedures",
    example: "/trpc/auth.login",
  });
});

// tRPC middleware for procedure calls
app.use(
  "/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error, path, ctx }) => {
      logger.error("tRPC error", {
        path,
        code: error.code,
        errorMessage: error.message,
        stack: error.stack,
        requestId: ctx?.req?.id,
        type: error.name,
      });
    },
  })
);

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ============================================
// EXPORT
// ============================================

export default app;
