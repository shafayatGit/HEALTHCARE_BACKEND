import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { ScheduleServices } from "./schedule.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { IQueryParams } from "../../interfaces/query.interface";

const createSchedule = () =>
  catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    // console.log({ payload });
    const result = await ScheduleServices.createSchedule(payload);

    sendResponse(res, {
      httpStatusCode: status.CREATED,
      success: true,
      message: "Schedule created successfully",
      data: result,
    });
  });

const getAllSchedules = () =>
  catchAsync(async (req: Request, res: Response) => {
    const query = req.query;
    const result = await ScheduleServices.getAllSchedules(
      query as IQueryParams,
    );
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Schedules retrieved successfully",
      data: result,
    });
  });

const getScheduleById = () =>
  catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await ScheduleServices.getScheduleById(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Schedule retrieved successfully",
      data: result,
    });
  });

const updateSchedule = () =>
  catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const payload = req.body;
    const result = await ScheduleServices.updateSchedule(id as string, payload);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Schedule updated successfully",
      data: result,
    });
  });

const deleteSchedule = () =>
  catchAsync(async (req: Request, res: Response) => {
    const id = req.params.id;
    const result = await ScheduleServices.deleteSchedule(id as string);
    sendResponse(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Schedule deleted successfully",
      data: result,
    });
  });
export const ScheduleController = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
