import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";

const globarErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler: ", err);
  }

  const errorSources: TErrrorSources[] = [];

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Internal Server Error";
  let stack: string | undefined = undefined;
  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources.push(...(simplifiedError.errorSources || []));
    stack = err.stack;
  }
  if (err instanceof Error) {
    // JS native class ERROR which is the parent of all the errors in JS
    message = err.message;
    stack = err.stack; // which line the error is coming from
  }

  const errorResponse: TErrorResponse = {
    success: false,
    message,
    errorSources,
    // stack: envVars.NODE_ENV === "development" ? stack : undefined, // we will use it when needed
    error: envVars.NODE_ENV === "development" ? err : undefined,
  };

  res.status(statusCode).json(errorResponse);
};
export default globarErrorHandler;
