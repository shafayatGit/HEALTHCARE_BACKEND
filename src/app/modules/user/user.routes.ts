import { NextFunction, Request, Response, Router } from "express";
import { userController } from "./user.controller";
import z from "zod";
import { Gender, Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorValidationSchema } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";

const router = Router();

router.post(
  "/create-doctor",
  // checkAuth(Role.ADMIN, Role.SUPER_ADMIN),
  validateRequest(createDoctorValidationSchema),
  userController.createDoctor,
);
// router.get("/doctor/:id", userController.getDoctor);

export const userRoutes = router;
