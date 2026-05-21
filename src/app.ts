import express, { Application, NextFunction, Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "./app/lib/prisma";
import { IndexRoutes } from "./app/routes";
import globarErrorHandler from "./app/middleware/globalErrorHandler";
import notFound from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import cors from "cors";
import { envVars } from "./app/config/env";

const app: Application = express();

app.set("view engine", "ejs"); //viewing frontend from backend
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(
  cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use("/api/auth", toNodeHandler(auth)); //for google login
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies.
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

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
