import { z } from "zod";

export const LoginRequestSchema = z.object({
  email: z.email("Email must be a string").trim(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginRequestDto = z.infer<typeof LoginRequestSchema>;
