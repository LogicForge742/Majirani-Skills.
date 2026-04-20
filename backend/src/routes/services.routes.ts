import { Router } from "express";
import * as ctrl from "../controllers/services.controller";
import { requireAuth, requireRole } from "../middleware/auth";

const router = Router();
router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", requireAuth, requireRole("ARTISAN", "ADMIN"), ctrl.create);
router.put("/:id", requireAuth, requireRole("ARTISAN", "ADMIN"), ctrl.update);
router.delete("/:id", requireAuth, requireRole("ARTISAN", "ADMIN"), ctrl.remove);
export default router;
