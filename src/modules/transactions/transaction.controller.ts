import { Request, Response } from "express";
import service from "./transaction.service";
import { CreateTransactionSchema } from "./dtos/create-transaction.dto";
import { GetTransactionsQuerySchema } from "./dtos/get-transaction.dto";

class TransactionController {
  async createTransaction(req: Request, res: Response) {
    const dto = CreateTransactionSchema.parse(req.body);

    const transaction = await service.createTransaction(
      req.user.id,
      dto,
    );

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
      nextCursor: hasNextPage
        ? items[items.length - 1].id
        : null,
    });
  }
}

export default new TransactionController();
