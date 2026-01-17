import { Request, Response } from "express";
import service from "./auth.service";
import { RegisterRequestSchema } from "./dtos/register-request.dto";

class AuthController {
  async register(req: Request, res: Response) {
    const parsed = RegisterRequestSchema.safeParse(req.body);

    if (!parsed.success) {
      res.status(400).json({
        message: "invalid request",
        errors: parsed.error.flatten(),
      });
    }

    const result = await service.register(parsed.data!);

    res.status(201).json(result);
  }
}

export default new AuthController();
