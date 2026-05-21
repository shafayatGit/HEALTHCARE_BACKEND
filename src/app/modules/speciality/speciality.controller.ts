import { Request, Response } from "express";
import { specialityService } from "./speciality.service";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";

const createSpeciality = catchAsync(async (req: Request, res: Response) => {
  console.log(req.body);
  // const payload = req.body;
  // const speciality = await specialityService.createSpeciality(payload);
  sendResponse(res, {
    httpStatusCode: 201,
    success: true,
    message: "Speciality created successfully",
    // data: speciality,
  });
});

const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await specialityService.getAllSpecialities();
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Speciality data fetched successfully",
    data: result,
  });
});

const deleteSpeciality = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await specialityService.deleteSpeciality(id as string);
  sendResponse(res, {
    httpStatusCode: 200,
    success: true,
    message: "Speciality deleted successfully",
    data: result,
  });
});

export const specialityController = {
  createSpeciality,
  getAllSpecialities,
  deleteSpeciality,
};
