import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";

interface TErrrorSources {
  path: string;
  message: string;
}

const globarErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler: ", err);
  }

  const errorSource: TErrrorSources[] = [];

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";

  if (err instanceof z.ZodError) {
    statusCode = status.BAD_REQUEST;
    message = "Zod Validation Error";

    err.issues.forEach((issue) => {
      errorSource.push({
        path: issue.path.join("=>") || "unknown",
        message: issue.message,
      });
    });
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    error: err.message,
    errorSource,
  });
};
export default globarErrorHandler;
