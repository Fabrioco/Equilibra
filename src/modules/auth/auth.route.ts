import { Router } from "express";
import controller from "./auth.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.post("/register", controller.register);
router.post("/login", controller.login);
router.get("/me", authMiddleware, controller.me);
router.put("/me", authMiddleware, controller.updateMe);

export default router;
