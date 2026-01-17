import { Router } from "express";
import authRouter from "./auth/auth.route";
import noAuthRouter from "./no-auth/no-auth.route";

const routes = Router();
routes.use("/auth", authRouter);
routes.use("/no-auth", noAuthRouter);

export default routes;
