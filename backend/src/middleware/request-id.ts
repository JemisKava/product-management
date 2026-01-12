/**
 * Request ID Middleware
 *
 * Adds a request ID to every request for log correlation.
 */

import type { Request, Response, NextFunction } from "express";
import { randomUUID } from "node:crypto";

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incomingId = req.header("x-request-id");
  const requestId =
    typeof incomingId === "string" && incomingId.length > 0
      ? incomingId
      : randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
}
