import { addHours, addMinutes, format, parse } from "date-fns";
import {
  ICreateSchedulePayload,
  IUpdateSchedulePayload,
} from "./schedule.interface";
import { convertDateTime } from "./schedule.utils";
import { prisma } from "../../lib/prisma";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/quaryBuilder";
import { Prisma, Schedule } from "../../../generated/prisma/client";
import {
  scheduleFilterableFields,
  scheduleIncludeConfig,
  scheduleSearchableFields,
} from "./schedule.constant";

const createSchedule = async (payload: ICreateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const interval = 30;

  const currentDate = new Date(startDate);
  const lastDate = new Date(endDate);

  const schedules = [];

  while (currentDate <= lastDate) {
    const dateString = format(currentDate, "yyyy-MM-dd");

    const startDateTime = addMinutes(
      addHours(
        parse(dateString, "yyyy-MM-dd", new Date()),
        Number(startTime.split(":")[0]),
      ),
      Number(startTime.split(":")[1]),
    );

    const endDateTime = addMinutes(
      addHours(
        parse(dateString, "yyyy-MM-dd", new Date()),
        Number(endTime.split(":")[0]),
      ),
      Number(endTime.split(":")[1]),
    );

    let currentSlot = new Date(startDateTime);

    while (currentSlot < endDateTime) {
      const s = await convertDateTime(new Date(currentSlot));
      const e = await convertDateTime(
        addMinutes(new Date(currentSlot), interval),
      );

      const scheduleData = {
        startDateTime: s,
        endDateTime: e,
      };

      const existingSchedule = await prisma.schedule.findFirst({
        where: {
          startDateTime: scheduleData.startDateTime,
          endDateTime: scheduleData.endDateTime,
        },
      });

      if (!existingSchedule) {
        const result = await prisma.schedule.create({
          data: scheduleData,
        });
        console.log(result);
        schedules.push(result);
      }

      currentSlot = addMinutes(currentSlot, interval);
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return schedules;
};

const getAllSchedules = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    Schedule,
    Prisma.ScheduleWhereInput,
    Prisma.ScheduleInclude
  >(prisma.schedule, query, {
    searchableFields: scheduleSearchableFields,
    filterableFields: scheduleFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .dynamicInclude(scheduleIncludeConfig)
    .sort()
    .fields()
    .execute();

  return result;
};

const getScheduleById = async (id: string) => {
  const result = await prisma.schedule.findUnique({
    where: {
      id,
    },
  });
  return result;
};

const updateSchedule = async (id: string, payload: IUpdateSchedulePayload) => {
  const { startDate, endDate, startTime, endTime } = payload;

  const startDateString = format(new Date(startDate), "yyyy-MM-dd");
  const endDateString = format(new Date(endDate), "yyyy-MM-dd");

  const startDateTime = addMinutes(
    addHours(
      parse(startDateString, "yyyy-MM-dd", new Date()),
      Number(startTime.split(":")[0]),
    ),
    Number(startTime.split(":")[1]),
  );

  const endDateTime = addMinutes(
    addHours(
      parse(endDateString, "yyyy-MM-dd", new Date()),
      Number(endTime.split(":")[0]),
    ),
    Number(endTime.split(":")[1]),
  );

  return await prisma.schedule.update({
    where: {
      id,
    },
    data: {
      startDateTime: startDateTime,
      endDateTime: endDateTime,
    },
  });
};

const deleteSchedule = async (id: string) => {
  const result = await prisma.schedule.delete({
    where: {
      id,
    },
  });
  return result;
};

export const ScheduleServices = {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  updateSchedule,
  deleteSchedule,
};
