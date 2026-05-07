import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";

const router = Router();

router.use("/specialities", SpecialityRoutes);
router.use("/auth", AuthRoutes);
router.use("/users", userRoutes);

export const IndexRoutes = router;
