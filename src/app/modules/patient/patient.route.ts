import { Router } from "express";
import { patientController } from "./patient.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { validateRequest } from "../../shared/validateRequest";
import { PatientValidation } from "./patient.validation";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";
import { updateMyPatientProfileMiddleware } from "./patient.middleware";
const router = Router();

router.patch(
  "/update-my-profile",
  checkAuth(Role.PATIENT),
  multerUpload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "medicalReports", maxCount: 5 },
  ]),
  updateMyPatientProfileMiddleware,
  validateRequest(PatientValidation.updatePatientProfileZodSchema),
  patientController.updateMyProfile,
);

export const patientRoutes = router;
