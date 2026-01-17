import { Router } from "express";
import controller from "./no-auth.controller";

const router = Router();

router.post("/forgot-password", controller.forgotPassword);

export default router;
