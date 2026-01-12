/**
 * tRPC Initialization
 *
 * Sets up tRPC with:
 * - Base procedure (public)
 * - Protected procedure (requires auth)
 * - Admin procedure (requires admin role)
 * - Permission-based procedures
 */

import { initTRPC, TRPCError } from "@trpc/server";
import type { Context, PermissionCode } from "./context.ts";

// ============================================
// tRPC INITIALIZATION
// ============================================

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape }) {
    return {
      ...shape,
      data: {
        ...shape.data,
      },
    };
  },
});

// ============================================
// EXPORTS
// ============================================

export const router = t.router;
export const publicProcedure = t.procedure;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

// ============================================
// MIDDLEWARE
// ============================================

/**
 * Middleware: Requires authentication
 * Throws UNAUTHORIZED if user is not logged in
 */
const isAuthed = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed to be non-null
    },
  });
});

/**
 * Middleware: Requires admin role
 * Throws FORBIDDEN if user is not admin
 */
const isAdmin = middleware(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }

  if (ctx.user.role !== "ADMIN") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only administrators can access this resource",
    });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});

/**
 * Middleware factory: Requires specific permission
 * @param permission - Permission code to check
 */
const hasPermission = (permission: PermissionCode) =>
  middleware(async ({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access this resource",
      });
    }

    // Admin has all permissions
    if (ctx.user.role === "ADMIN") {
      return next({ ctx: { ...ctx, user: ctx.user } });
    }

    // Check if user has the required permission
    if (!ctx.user.permissions.includes(permission)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `You don't have permission to ${permission.toLowerCase().replace(/_/g, " ")}`,
      });
    }

    return next({
      ctx: {
        ...ctx,
        user: ctx.user,
      },
    });
  });

// ============================================
// PROCEDURES
// ============================================

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = publicProcedure.use(isAuthed);

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = publicProcedure.use(isAdmin);

/**
 * Permission-based procedures
 */
export const viewProductProcedure = publicProcedure.use(hasPermission("PRODUCT_VIEW"));
export const createProductProcedure = publicProcedure.use(hasPermission("PRODUCT_CREATE"));
export const editProductProcedure = publicProcedure.use(hasPermission("PRODUCT_EDIT"));
export const deleteProductProcedure = publicProcedure.use(hasPermission("PRODUCT_DELETE"));
export const bulkProductProcedure = publicProcedure.use(hasPermission("PRODUCT_BULK"));

// ============================================
// TYPE EXPORTS
// ============================================

export type Router = typeof router;
export type PublicProcedure = typeof publicProcedure;
export type ProtectedProcedure = typeof protectedProcedure;
export type AdminProcedure = typeof adminProcedure;
