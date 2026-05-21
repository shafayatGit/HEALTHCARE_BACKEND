import { NextFunction, Request, Response, Router } from "express";
import { specialityController } from "./speciality.controller";
import { Role } from "../../../generated/prisma/enums";
import { checkAuth } from "../../middleware/checkAuth";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  multerUpload.single("file"),
  specialityController.createSpeciality,
);
router.get(
  "/",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT),
  specialityController.getAllSpecialities,
);
router.delete("/:id", specialityController.deleteSpeciality);

export const SpecialityRoutes = router;
