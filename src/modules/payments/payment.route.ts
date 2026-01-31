import { Router } from "express";
import controller from "./payment.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const routes = Router();

routes.post("/subscribe", authMiddleware, controller.subscribe);

routes.post("/webhooks/asaas", controller.handleWebhook);

routes.post("/cancel", authMiddleware, controller.cancel);

export default routes;
