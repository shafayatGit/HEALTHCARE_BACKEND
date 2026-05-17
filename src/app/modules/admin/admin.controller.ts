import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { adminServices } from "./admin.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";

const getAllAdmin = catchAsync(async (req: Request, res: Response) => {
  const result = await adminServices.getAllAdmin();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "All Admin Data Retrieved.",
    data: result,
  });
});

const getAdminById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await adminServices.getAdminById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Admin Data Retrieved",
    data: result,
  });
});

export const adminControllers = {
  getAllAdmin,
  getAdminById,
};
