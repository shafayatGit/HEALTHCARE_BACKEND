import { Router } from "express";
import { doctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { updateDoctorValidationSchema } from "./doctor.validation";

const router = Router();

router.get("/", doctorController.getAllDoctors);
router.get("/:id", doctorController.getDoctorById);
router.patch(
  "/:id",
  validateRequest(updateDoctorValidationSchema),
  doctorController.updateDoctor,
);
router.delete("/:id", doctorController.softDeleteDoctor);

export const doctorsRoutes = router;
