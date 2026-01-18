import { Request, Response } from "express";
import service from "./transaction.service";
import { CreateTransactionSchema } from "./dtos/create-transaction.dto";
import { AppError } from "../../middlewares/error";

class TransactionController {
  async createTransaction(req: Request, res: Response) {
    try {
      const dto = CreateTransactionSchema.parse(req.body);

      const result = await service.createTransaction(req.user.id, dto);

      return res.status(201).json(result);
    } catch (error: Error | any) {
      throw new AppError(error.message, 400);
    }
  }
}

export default new TransactionController();
