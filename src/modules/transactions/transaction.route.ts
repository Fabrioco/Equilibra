import { Router } from "express";
import controller from "./transaction.controller";

const router = Router();

router.post("/", controller.createTransaction);

export default router;
