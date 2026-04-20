import { Router } from "express";
import * as ctrl from "../controllers/auth.controller";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/me", requireAuth, ctrl.me);
export default router;
