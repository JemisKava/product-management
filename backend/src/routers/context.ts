/**
 * tRPC Context
 *
 * Creates the context for each tRPC request.
 * Contains user info if authenticated, request/response objects.
 */

import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { Request, Response } from "express";
import { verifyAccessToken } from "../lib/jwt.ts";
import { prisma } from "../config/database.ts";

// ============================================
// TYPES
// ============================================

export interface User {
  id: number;
  email: string;
  name: string;
  role: "ADMIN" | "EMPLOYEE";
}

export interface ContextUser extends User {
  permissions: string[];
}

export interface Context {
  req: Request;
  res: Response;
  user: ContextUser | null;
  prisma: typeof prisma;
}

// ============================================
// PERMISSION CODES
// ============================================

export const ALL_PERMISSIONS = [
  "PRODUCT_VIEW",
  "PRODUCT_CREATE",
  "PRODUCT_EDIT",
  "PRODUCT_DELETE",
  "PRODUCT_BULK",
] as const;

export type PermissionCode = (typeof ALL_PERMISSIONS)[number];

// ============================================
// CONTEXT CREATION
// ============================================

/**
 * Create context for each tRPC request
 * Extracts user from JWT token in Authorization header only
 * Uses JWT access token strategy (no session cookies)
 */
export async function createContext({
  req,
  res,
}: CreateExpressContextOptions): Promise<Context> {
  let user: ContextUser | null = null;

  // Get user from JWT token in Authorization header
  const authHeader = req.headers.authorization;

  if (authHeader?.startsWith("Bearer ")) {
    try {
      const token = authHeader.slice(7);
      const decoded = verifyAccessToken(token);

      // Get user permissions from database
      const permissions = await getUserPermissions(decoded.userId, decoded.role);

      user = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role,
        permissions,
      };
    } catch {
      // Token invalid or expired - user remains null
    }
  }

  return {
    req,
    res,
    user,
    prisma,
  };
}

// ============================================
// HELPERS
// ============================================

/**
 * Get user permissions from database
 * Admin gets all permissions, Employee gets assigned ones
 */
async function getUserPermissions(
  userId: number,
  role: "ADMIN" | "EMPLOYEE"
): Promise<string[]> {
  // Admin has all permissions
  if (role === "ADMIN") {
    return [...ALL_PERMISSIONS];
  }

  // Employee - fetch from database
  const userPermissions = await prisma.userPermission.findMany({
    where: { userId },
    include: { permission: true },
  });

  return userPermissions.map((up) => up.permission.code);
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(
  user: ContextUser | null,
  permission: PermissionCode
): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return user.permissions.includes(permission);
}
