import { Router } from "express";
import { AuthRoutes } from "../modules/auth/auth.routes";
import { SpecialityRoutes } from "../modules/speciality/speciality.route";
import { userRoutes } from "../modules/user/user.routes";
import { patientRoutes } from "../modules/patient/patient.route";
import { doctorsRoutes } from "../modules/doctor/doctor.route";
import { scheduleRoutes } from "../modules/schedule/schedule.routes";
import { DoctorScheduleRoutes } from "../modules/doctorSchedule/doctorSchedule.routes";
import { AppointmentRoutes } from "../modules/appointment/appointment.routes";
import { PrescriptionRoutes } from "../modules/prescription/prescription.route";
import { ReviewRoutes } from "../modules/review/review.route";
import { PaymentRoutes } from "../modules/payment/payment.routes";
import { StatsRoutes } from "../modules/stats/stats.route";
import { AdminRoutes } from "../modules/admin/admin.routes";
import { RagRouter } from "../modules/rag/rag.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialityRoutes);
router.use("/users", userRoutes);
router.use("/patients", patientRoutes);
router.use("/doctors", doctorsRoutes);
router.use("/admins", AdminRoutes);
router.use("/schedules", scheduleRoutes);
router.use("/doctor-schedules", DoctorScheduleRoutes);
router.use("/appointments", AppointmentRoutes);
router.use("/prescriptions", PrescriptionRoutes);
router.use("/reviews", ReviewRoutes);
router.use("/stats", StatsRoutes);
router.use("/payments", PaymentRoutes);
router.use("/rag", RagRouter);

export const IndexRoutes = router;
