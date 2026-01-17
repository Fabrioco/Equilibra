import { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof AppError) {
    return res
      .status(err.status)
      .json({ message: err.message, statusCode: err.status });
  }

  console.log(err);
  return res.status(500).json({ message: "Internal Server Error" });
}
