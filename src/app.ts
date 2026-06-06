import express, { Application, Request, Response } from "express";
import { prisma } from "./app/lib/prisma";
import { IndexRoutes } from "./app/routes";
import globarErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { envVars } from "./app/config/env";
import qs from "qs";
import { PaymentController } from "./app/modules/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/modules/appointment/appointment.service";
const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));

app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handleStripeWebhookEvent,
);

app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:8000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies.
app.use(express.json());
app.use(cookieParser());

cron.schedule(
  "*/25 * * * *", // Run every 25 minutes
  async () => {
    try {
      console.log("Running cron job to cancel unpaid appointments");
      await AppointmentService.cancelUnpaidAppointments();
    } catch (error) {
      console.error(error);
    }
  },
);

// Basic route
app.use("/api/v1", IndexRoutes);

app.get("/", async (req: Request, res: Response) => {
  const specialities = await prisma.speciality.create({
    data: {
      title: "Speciality 1",
      description: "Description 1",
      icon: "icon 1",
    },
  });
  res.status(200).json(specialities);
});

app.use(globarErrorHandler);
app.use(notFound);

export default app;
