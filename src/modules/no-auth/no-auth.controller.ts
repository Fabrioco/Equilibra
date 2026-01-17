import { Request, Response } from "express";
import { ForgotPasswordSchema } from "./dtos/forgot-password.dto";
import service from "./no-auth.service";

class noAuthController {
  async forgotPassword(req: Request, res: Response) {
    const parsed = ForgotPasswordSchema.safeParse(req.body);
    const result = await service.forgotPassword(parsed.data!);
    res.status(200).json(result);
  }
}

export default new noAuthController();
