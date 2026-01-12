/**
 * Permission middleware for non-tRPC routes.
 *
 * Uses the access token from the Authorization header to validate permissions.
 */

import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/database.ts";
import { verifyAccessToken } from "../lib/jwt.ts";
import type { PermissionCode } from "../trpc/context.ts";

const sendAuthError = (
  res: Response,
  status: number,
  code: string,
  message: string
) =>
  res.status(status).json({
    success: false,
    error: { code, message },
  });

const getBearerToken = (req: Request) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice(7);
};

export const requireAnyPermission =
  (permissions: readonly PermissionCode[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = getBearerToken(req);
    if (!token) {
      return sendAuthError(res, 401, "UNAUTHORIZED", "Not authenticated");
    }

    try {
      const decoded = verifyAccessToken(token);

      if (decoded.role === "ADMIN") {
        return next();
      }

      const matches = await prisma.userPermission.findMany({
        where: {
          userId: decoded.userId,
          permission: { code: { in: [...permissions] } },
        },
        select: { id: true },
      });

      if (matches.length === 0) {
        return sendAuthError(
          res,
          403,
          "FORBIDDEN",
          "Insufficient permissions"
        );
      }

      return next();
    } catch {
      return sendAuthError(res, 401, "UNAUTHORIZED", "Invalid or expired token");
    }
  };
