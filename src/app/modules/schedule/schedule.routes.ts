import { Router } from "express";
import { ScheduleControllers } from "./schedule.controller";

const router = Router();
router.post("/", ScheduleControllers.createSchedule);

export const ScheduleRoutes = router;
