import { Router } from "express";
import { adminControllers } from "./admin.controller";

const router = Router();

router.get("/", adminControllers.getAllAdmin);
router.get("/:id", adminControllers.getAdminById);

export const adminRoutes = router;
