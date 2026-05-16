import { Router } from "express";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { userRoutes } from "../modules/user/user.routes";
import { doctorsRoutes } from "../modules/doctor/doctor.route";
import { adminRoutes } from "../modules/admin/admin.routes";
import { ScheduleRoutes } from "../modules/schedule/schedule.routes";

const router = Router();

router.use("/specialities", SpecialityRoutes);
router.use("/auth", AuthRoutes);
router.use("/users", userRoutes);
router.use("/doctors", doctorsRoutes);
router.use("/admins", adminRoutes);
router.use("/schedules", ScheduleRoutes);

export const IndexRoutes = router;
