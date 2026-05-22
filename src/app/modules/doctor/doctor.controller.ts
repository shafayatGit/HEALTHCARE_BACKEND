import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { doctorService } from "./doctor.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllDoctors = catchAsync(async (req: Request, res: Response) => {
  const query = req.query;
  const doctors = await doctorService.getAllDoctors(query as IQueryParams);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctors retrieved successfully",
    data: doctors.data,
    meta: doctors.meta,
  });
});

const getDoctorById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = await doctorService.getDoctorById(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor retrieved successfully",
    data: doctor,
  });
});

const updateDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const payload = req.body;
  const doctor = await doctorService.updateDoctor(id as string, payload);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor updated successfully",
    data: doctor,
  });
});

const softDeleteDoctor = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const doctor = await doctorService.softDeleteDoctor(id as string);
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctor soft deleted successfully",
    data: doctor,
  });
});

export const doctorController = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor,
};
