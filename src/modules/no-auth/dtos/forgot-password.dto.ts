import { z } from "zod";

export const ForgotPasswordSchema = z.object({
    email: z.email("Email must be a string").trim(),
});

export type ForgotPasswordDto = z.infer<typeof ForgotPasswordSchema>;