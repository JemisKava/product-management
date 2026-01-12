/**
 * Role Validation Schemas
 *
 * Zod schemas for role management operations
 */

import { z } from "zod";

// ============================================
// CREATE ROLE
// ============================================

export const createRoleSchema = z.object({
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name must be at most 100 characters"),
  code: z
    .string()
    .min(2, "Role code must be at least 2 characters")
    .max(100, "Role code must be at most 100 characters")
    .regex(/^[a-z0-9_]+$/, "Role code must be lowercase alphanumeric with underscores"),
  description: z.string().max(255, "Description too long").optional(),
  permissionCodes: z.array(z.string()).default([]),
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;

// ============================================
// UPDATE ROLE
// ============================================

export const updateRoleSchema = z.object({
  id: z.number().int().positive(),
  name: z
    .string()
    .min(2, "Role name must be at least 2 characters")
    .max(100, "Role name must be at most 100 characters")
    .optional(),
  description: z.string().max(255, "Description too long").optional().nullable(),
  permissionCodes: z.array(z.string()).optional(),
});

export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;

// ============================================
// DELETE ROLE
// ============================================

export const roleIdSchema = z.object({
  id: z.number().int().positive(),
});

export type RoleIdInput = z.infer<typeof roleIdSchema>;

// ============================================
// LIST ROLES
// ============================================

export const listRolesSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  includeSystem: z.boolean().default(true), // Include system roles (ADMIN, EMPLOYEE)
});

export type ListRolesInput = z.infer<typeof listRolesSchema>;

// ============================================
// ASSIGN ROLE TO USERS
// ============================================

export const assignRoleToUsersSchema = z.object({
  roleId: z.number().int().positive(),
  userIds: z.array(z.number().int().positive()).min(1, "At least one user must be selected"),
});

export type AssignRoleToUsersInput = z.infer<typeof assignRoleToUsersSchema>;
