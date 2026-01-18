import { Router } from "express";
import controller from "./transaction.controller";

const router = Router();

router.post("/", controller.createTransaction);
router.get("/", controller.getTransactions);
router.get("/:id", controller.getOneTransaction);

export default router;
