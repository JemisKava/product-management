/**
 * Error Handler Middleware
 *
 * Global error handler for Express.
 */

import type { Request, Response, NextFunction } from "express";
import { isAppError, wrapError } from "../lib/errors.ts";
import { isDev } from "../config/env.ts";
import { logger } from "../lib/logger.ts";

// Error response type
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
    stack?: string;
  };
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Convert to AppError if not already
  const appError = isAppError(err) ? err : wrapError(err);

  const logLevel = appError.statusCode >= 500 ? "error" : "warn";
  logger.log(logLevel, "Request error", {
    requestId: req.id,
    method: req.method,
    path: req.originalUrl,
    statusCode: appError.statusCode,
    code: appError.code,
    errorMessage: appError.message,
    details: appError.details ?? undefined,
    stack: appError.statusCode >= 500 || isDev ? appError.stack : undefined,
  });

  // Build response
  const errorObj: ErrorResponse["error"] = {
    code: appError.code,
    message: appError.message,
  };

  // Add details if present and is an object
  if (appError.details !== undefined && appError.details !== null) {
    errorObj.details = appError.details;
  }

  // Add stack trace in development
  if (isDev && appError.stack) {
    errorObj.stack = appError.stack;
  }

  const response: ErrorResponse = {
    success: false,
    error: errorObj,
  };

  res.status(appError.statusCode).json(response);
}

/**
 * Not found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
