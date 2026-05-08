import { Router } from "express";
import { userController } from "./user.controller";

const router = Router()

router.post("/create-doctor", userController.createDoctor); 
router.get("/doctor/:id", userController.getDoctor);

export const userRoutes = router;
