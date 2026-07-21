import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { RAGService } from "./rag.service";

const ragService = new RAGService();

const getStats = catchAsync(async (req: Request, res: Response) => {
  // const stats = await RagService.getStats();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Stats fetched successfully",
    data: {
      totalPatients: 100,
      totalDoctors: 100,
      totalAppointments: 100,
      totalPrescriptions: 100,
      totalReviews: 100,
      totalPayments: 100,
      totalStats: 100,
    },
  });
});

const ingestDoctors = catchAsync(async (req: Request, res: Response) => {
  const { doctors } = req.body;
  const result = await ragService.ingestDoctorsData();
  sendResponse(res, {
    httpStatusCode: status.OK,
    success: true,
    message: "Doctors ingested successfully",
  });
});

export const RagController = {
  getStats,
  ingestDoctors,
};
