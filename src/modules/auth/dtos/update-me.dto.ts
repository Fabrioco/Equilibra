import { z } from "zod";

export const UpdateMeSchema = z.object({
  name: z.string("name must be a string").trim().min(3).optional(),
  email: z.email("email must be a valid email").trim().optional(),
  password: z.string("password must be a string").trim().min(8).optional(),
});

export type UpdateMeDto = z.infer<typeof UpdateMeSchema>;
