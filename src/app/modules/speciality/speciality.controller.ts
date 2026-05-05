import { NextFunction, Request, Response } from "express";
import { specialityService } from "./speciality.service";
import { catchAsync } from "../../shared/catchAsync";

const createSpeciality = catchAsync(async (req: Request, res: Response) => {
  const payload = req.body;
  const speciality = await specialityService.createSpeciality(payload);
  res.status(201).json({
    success: true,
    message: "Speciality created successfully",
    data: speciality,
  });
});

const getAllSpecialities = catchAsync(async (req: Request, res: Response) => {
  const result = await specialityService.getAllSpecialities();
  res.status(200).json({
    success: true,
    message: "Speciality data fetched successfully",
    data: result,
  });
});

const deleteSpeciality = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await specialityService.deleteSpeciality(id as string);
  res.status(200).json({
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
