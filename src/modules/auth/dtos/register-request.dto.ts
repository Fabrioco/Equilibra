import { z } from "zod";

export const RegisterRequestSchema = z.object({
  name: z.string("name must be a string").trim().min(3),
  email: z.email("email must be a valid email").trim(),
  password: z.string("password must be a string").trim().min(8),
});

export type RegisterRequestDto = z.infer<typeof RegisterRequestSchema>;
