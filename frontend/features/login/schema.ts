import { z } from "zod";
import { passwordSchema } from "@/lib/validation/password";

export const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: passwordSchema,
});

export type LoginFormValues = z.infer<typeof loginSchema>;
