import { NextFunction, Request, Response } from "express";
import { envVars } from "../config/env";
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrrorSources } from "../interfaces/error.interface";
import { handleZodError } from "../errorHelpers/handleZodError";
import AppError from "../errorHelpers/AppError";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";
import { deleteUploadedFilesFromGlobalErrorHandler } from "../utils/deleteUploadedFilesFromGlobalErrorHandler";

const globarErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.log("Error from Global Error Handler: ", err);
  }

  // if (req.file) {
  //   await deleteFileFromCloudinary(req.file.path);
  // }

  // if (req.files && Array.isArray(req.files) && req.files.length > 0) {
  //   const imageUrls = req.files.map((file) => file.path);
  //   await Promise.all(imageUrls.map((url) => deleteFileFromCloudinary(url)));
  // }
  await deleteUploadedFilesFromGlobalErrorHandler(req);
  let errorSources: TErrrorSources[] = [];

  let statusCode: number = status.INTERNAL_SERVER_ERROR;

  let message: string = "Internal Server Error";

  let stack: string | undefined = undefined;

  if (err instanceof z.ZodError) {
    const simplifiedError = handleZodError(err);
    statusCode = simplifiedError.statusCode as number;
    message = simplifiedError.message;
    errorSources.push(...(simplifiedError.errorSources || []));
    stack = err.stack;
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    stack = err.stack;
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
  } else if (err instanceof Error) {
    // JS native class ERROR which is the parent of all the errors in JS
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = err.message;
    stack = err.stack; // which line the error is coming from
    errorSources = [
      {
        path: "",
        message: err.message,
      },
    ];
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
