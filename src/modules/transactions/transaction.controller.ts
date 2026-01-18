import { Request, Response } from "express";
import service from "./transaction.service";
import { CreateTransactionSchema } from "./dtos/create-transaction.dto";
import { GetTransactionsQuerySchema } from "./dtos/get-transaction.dto";
import { UpdateTransactionSchema } from "./dtos/update-transaction.dto";

class TransactionController {
  async createTransaction(req: Request, res: Response) {
    const dto = CreateTransactionSchema.parse(req.body);

    const transaction = await service.createTransaction(req.user.id, dto);

    return res.status(201).json(transaction);
  }

  async getTransactions(req: Request, res: Response) {
    const query = GetTransactionsQuerySchema.parse(req.query);

    const data = await service.getTransactions(req.user.id, query);

    const limit = query.limit ?? 20;
    const hasNextPage = data.length > limit;
    const items = hasNextPage ? data.slice(0, limit) : data;

    return res.status(200).json({
      items,
      nextCursor: hasNextPage ? items[items.length - 1].id : null,
    });
  }

  async getOneTransaction(req: Request, res: Response) {
    const result = await service.getOne(+req.params.id);

    return res.status(200).json(result);
  }

  async updateTransaction(req: Request, res: Response) {
    const dto = UpdateTransactionSchema.parse(req.body);

    const result = await service.updateTransaction(
      +req.params.id,
      req.user.id,
      dto,
    );

    return res.status(200).json(result);
  }
}

export default new TransactionController();
