/**
 * User Schemas
 *
 * Zod validation schemas for user management.
 */

import { z } from "zod";

// ============================================
// CREATE USER
// ============================================

export const createUserSchema = z.object({
  email: z
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  isActive: z.boolean().optional().default(true),
  permissionCodes: z.array(z.string()).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

// ============================================
// UPDATE USER
// ============================================

export const updateUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email("Invalid email address").optional(),
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    )
    .optional(),
  isActive: z.boolean().optional(),
  permissionCodes: z.array(z.string()).optional(),
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ============================================
// USER ID
// ============================================

export const userIdSchema = z.object({
  id: z.number().int().positive(),
});

export type UserIdInput = z.infer<typeof userIdSchema>;

// ============================================
// LIST USERS
// ============================================

export const listUsersSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  name: z.string().optional(),
  email: z.string().optional(),
  isActive: z.boolean().optional(),
  roles: z.array(z.enum(["ADMIN", "EMPLOYEE"])).optional(),
  permissionCodes: z.array(z.string()).optional(),
});

export type ListUsersInput = z.infer<typeof listUsersSchema>;

// ============================================
// PERMISSION ASSIGNMENT
// ============================================

export const assignPermissionsSchema = z.object({
  userId: z.number().int().positive(),
  permissionCodes: z.array(z.string()),
});

export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>;

export const bulkAssignPermissionsSchema = z.object({
  userIds: z.array(z.number().int().positive()).min(1),
  permissionCodes: z.array(z.string()),
  replaceExisting: z.boolean().optional(),
});

export type BulkAssignPermissionsInput = z.infer<typeof bulkAssignPermissionsSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export const userSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type User = z.infer<typeof userSchema>;

export const userWithPermissionsSchema = userSchema.extend({
  permissions: z.array(z.string()),
});

export type UserWithPermissions = z.infer<typeof userWithPermissionsSchema>;
