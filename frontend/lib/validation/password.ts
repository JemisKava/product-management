import { z } from "zod";

export const PASSWORD_REQUIREMENTS = [
  {
    regex: /.{8,}/,
    text: "At least 8 characters",
    message: "Password must be at least 8 characters",
  },
  {
    regex: /[0-9]/,
    text: "At least 1 number",
    message: "Password must include at least 1 number",
  },
  {
    regex: /[a-z]/,
    text: "At least 1 lowercase letter",
    message: "Password must include at least 1 lowercase letter",
  },
  {
    regex: /[A-Z]/,
    text: "At least 1 uppercase letter",
    message: "Password must include at least 1 uppercase letter",
  },
] as const;

export const passwordSchema = PASSWORD_REQUIREMENTS.reduce(
  (schema, requirement) => schema.regex(requirement.regex, requirement.message),
  z.string().min(1, "Password is required")
);
