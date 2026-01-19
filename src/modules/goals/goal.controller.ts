import { Request, Response } from "express";
import { CreateGoalSchema } from "./dtos/create-goal.dto";
import service from "./goal.service";

class goalController {
  async create(req: Request, res: Response) {
    const dto = CreateGoalSchema.parse(req.body);
    const result = await service.create(req.user.id, dto);
    return res.status(201).json(result);
  }
}
export default new goalController();
