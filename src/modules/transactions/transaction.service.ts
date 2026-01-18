import { prisma } from "../../lib/prisma";
import { AppError } from "../../middlewares/error";
import { CreateTransactionDto } from "./dtos/create-transaction.dto";
import {
  TransactionRecurrence,
  TransactionType,
} from "../../generated/prisma/client";

export class GetTransactionsQueryDto {
  limit?: number;
  cursor?: number;

  startDate?: Date;
  endDate?: Date;

  type?: TransactionType;
  category?: string;
  recurrence?: TransactionRecurrence;

  minAmount?: number;
  maxAmount?: number;

  search?: string;
}

class TransactionService {
  async createTransaction(userId: number, dto: CreateTransactionDto) {
    switch (dto.recurrence) {
      case TransactionRecurrence.ONE_TIME:
        return this.createOneTime(userId, dto);

      case TransactionRecurrence.FIXED:
        return this.createFixed(userId, dto);

      case TransactionRecurrence.INSTALLMENT:
        return this.createInstallment(userId, dto);

      default:
        throw new AppError("Invalid recurrence type", 400);
    }
  }
  async getTransactions(userId: number, query: GetTransactionsQueryDto) {
    const {
      limit = 20,
      cursor,
      startDate,
      endDate,
      type,
      category,
      recurrence,
      minAmount,
      maxAmount,
      search,
    } = query;

    return prisma.transaction.findMany({
      take: limit + 1,
      skip: cursor ? 1 : 0,
      cursor: cursor ? { id: cursor } : undefined,

      where: {
        userId,

        ...(type && { type }),
        ...(category && { category }),
        ...(recurrence && { recurrence }),

        ...(startDate || endDate
          ? {
              date: {
                ...(startDate && { gte: startDate }),
                ...(endDate && { lte: endDate }),
              },
            }
          : {}),

        ...(minAmount || maxAmount
          ? {
              amount: {
                ...(minAmount && { gte: minAmount }),
                ...(maxAmount && { lte: maxAmount }),
              },
            }
          : {}),

        ...(search && {
          title: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },

      orderBy: {
        date: "desc",
      },
    });
  }

  async getOne(id: number) {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });
    if(!transaction){
      throw new AppError("Transaction not found", 404)
    }
    return transaction
  }

  private async createOneTime(userId: number, dto: CreateTransactionDto) {
    return prisma.transaction.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        type: dto.type,
        recurrence: TransactionRecurrence.ONE_TIME,
        date: dto.date,
        userId,
      },
    });
  }
  private async createFixed(userId: number, dto: CreateTransactionDto) {
    return prisma.transaction.create({
      data: {
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        type: dto.type,
        recurrence: TransactionRecurrence.FIXED,
        date: dto.date,
        userId,
      },
    });
  }

  private async createInstallment(userId: number, dto: CreateTransactionDto) {
    if (!dto.totalInstallment || dto.totalInstallment < 2) {
      throw new AppError(
        "totalInstallment must be greater than 1 for INSTALLMENT",
        400,
      );
    }

    const baseDate = new Date(dto.date);

    const transactions = [];
    for (let i = 1; i <= dto.totalInstallment; i++) {
      const installmentDate = new Date(baseDate);
      installmentDate.setMonth(baseDate.getMonth() + (i - 1));

      transactions.push({
        title: dto.title,
        amount: dto.amount,
        category: dto.category,
        type: dto.type,
        recurrence: TransactionRecurrence.INSTALLMENT,
        totalInstallment: dto.totalInstallment,
        installmentIndex: i,
        date: installmentDate, // ✅ Date
        userId,
      });
    }

    return prisma.transaction.createMany({
      data: transactions,
    });
  }

  private formatDateOnly(date: Date): string {
    return date.toISOString().slice(0, 10); // yyyy-mm-dd
  }
}

export default new TransactionService();
