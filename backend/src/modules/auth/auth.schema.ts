/**
 * Auth Schemas
 *
 * Zod validation schemas for authentication.
 */

import { z } from "zod";

// ============================================
// LOGIN
// ============================================

export const loginSchema = z.object({
  email: z
    .email("Invalid email address")
    .min(1, "Email is required"),
  password: z
    .string()
    .min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ============================================
// REGISTER (for creating employees)
// ============================================

export const registerSchema = z.object({
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
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ============================================
// CHANGE PASSWORD
// ============================================

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ============================================
// RESPONSE TYPES
// ============================================

export const authUserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  role: z.enum(["ADMIN", "EMPLOYEE"]),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  user: authUserSchema,
  permissions: z.array(z.string()),
  accessToken: z.string(),
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;
