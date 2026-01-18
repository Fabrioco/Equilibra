import { z } from "zod";

export const ResetPasswordSchema = z.object({
  email: z.email("email must be a valid email").trim(),
  token: z
    .string()
    .min(6, "Token must be at least 6 characters")
    .max(6, "Token must be at most 6 characters"),
  newPassword: z
    .string("newPassword must be a string")
    .trim()
    .min(8, "newPassword should be least than 8 character"),
  confirmNewPassword: z
    .string("confirmNewPassword must be a string")
    .trim()
    .min(8, "confirmNewPassword should be least than 8 character"),
});

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
