/**
 * Request Logger Middleware
 *
 * Logs HTTP request metadata with duration and status.
 */

import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger.ts";
import { isTest } from "../config/env.ts";

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "accessToken",
  "refreshToken",
  "authorization",
  "cookie",
]);

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const sanitized: Record<string, unknown> = {};

    for (const [key, val] of Object.entries(record)) {
      if (SENSITIVE_KEYS.has(key)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = sanitizeValue(val);
      }
    }

    return sanitized;
  }

  return value;
}

function getContentLength(res: Response): number | undefined {
  const header = res.getHeader("content-length");

  if (typeof header === "number") {
    return header;
  }

  if (typeof header === "string") {
    const parsed = Number(header);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  if (Array.isArray(header) && header.length > 0) {
    const parsed = Number(header[0]);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (isTest) {
    next();
    return;
  }

  const start = process.hrtime.bigint();
  let logged = false;

  const logRequest = (aborted: boolean) => {
    const durationMs = Number((process.hrtime.bigint() - start) / BigInt(1e6));
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
    const contentLength = getContentLength(res);

    const sanitizedQuery = sanitizeValue(req.query);
    const queryMeta =
      sanitizedQuery &&
      typeof sanitizedQuery === "object" &&
      Object.keys(sanitizedQuery as Record<string, unknown>).length > 0
        ? sanitizedQuery
        : undefined;

    logger.log(level, "HTTP request", {
      requestId: req.id,
      method: req.method,
      path: req.originalUrl.split("?")[0],
      statusCode,
      durationMs,
      contentLength,
      ip: req.ip,
      userAgent: req.get("user-agent"),
      query: queryMeta,
      aborted,
    });
  };

  res.on("finish", () => {
    if (logged) return;
    logged = true;
    logRequest(false);
  });

  res.on("close", () => {
    if (logged) return;
    logged = true;
    logRequest(true);
  });

  next();
}
