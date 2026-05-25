import z from "zod";

const timeFormatRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;

const createScheduleZodSchema = z.object({
  startDate: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
  endDate: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
  startTime: z.string().refine((data) => timeFormatRegex.test(data), {
    message: "Invalid time format. Use HH:MM",
  }),
  endTime: z.string().refine((data) => timeFormatRegex.test(data), {
    message: "Invalid time format. Use HH:MM",
  }),
});

const updateScheduleZodSchema = z.object({
  startDate: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
  endDate: z.string().refine((data) => !isNaN(Date.parse(data)), {
    message: "Invalid date format",
  }),
  startTime: z.string().refine((data) => timeFormatRegex.test(data), {
    message: "Invalid time format. Use HH:MM",
  }),
  endTime: z.string().refine((data) => timeFormatRegex.test(data), {
    message: "Invalid time format. Use HH:MM",
  }),
});

export const scheduleValidation = {
  createScheduleZodSchema,
  updateScheduleZodSchema,
};
