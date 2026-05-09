import { Router } from "express";
import { doctorController } from "./doctor.controller";

const router = Router();

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.patch("/:id", doctorController.updateDoctor);
router.delete("/:id", doctorController.softDeleteDoctor);

export const doctorsRoutes = router;
