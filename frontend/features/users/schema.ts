import { z } from "zod";
import { passwordSchema } from "@/lib/validation/password";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Enter a valid email address"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required"),
    isActive: z.boolean(),
    permissionCodes: z.array(z.string()),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export const editUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z.string().email("Enter a valid email address"),
    isActive: z.boolean(),
    changePassword: z.boolean(),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
    permissionCodes: z.array(z.string()),
  })
  .refine(
    (data) => {
      if (data.changePassword) {
        return data.password && passwordSchema.safeParse(data.password).success;
      }
      return true;
    },
    {
      message:
        "Password must be at least 8 characters with uppercase, lowercase, number, and special character",
      path: ["password"],
    }
  )
  .refine(
    (data) => {
      if (data.changePassword && data.password) {
        return data.password === data.confirmPassword;
      }
      return true;
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"],
    }
  );

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type EditUserValues = z.infer<typeof editUserSchema>;
