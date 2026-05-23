import { DoctorSchedules, Prisma } from "../../../generated/prisma/client";
import { IQueryParams } from "../../interfaces/query.interface";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/quaryBuilder";
import { doctorSearchableFields } from "../doctor/doctor.constant";
import {
  doctorScheduleFilterableFields,
  doctorScheduleIncludeConfig,
  doctorScheduleSearchableFields,
} from "./doctorSchedule.constant";
import {
  ICreateDoctorSchedulePayload,
  IUpdateDoctorSchedulePayload,
} from "./doctorSchedule.interface";

const createMyDoctorSchedule = async (
  user: IRequestUser,
  payload: ICreateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorScheduleData = payload.scheduleIds.map((scheduleId) => {
    return {
      doctorId: doctorData.id,
      scheduleId,
    };
  });

  const result = await prisma.doctorSchedules.createMany({
    data: doctorScheduleData,
  });
  return result;
};

const getMyDoctorSchedules = async (
  user: IRequestUser,
  query: IQueryParams,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const queryBuilder = new QueryBuilder<
    DoctorSchedules,
    Prisma.DoctorSchedulesWhereInput,
    Prisma.DoctorSchedulesInclude
  >(
    prisma.doctorSchedules,
    {
      doctorId: doctorData.id,
      ...query,
    },
    {
      searchableFields: doctorScheduleSearchableFields,
      filterableFields: doctorScheduleFilterableFields,
    },
  );

  const doctorSchedule = queryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .include({
      schedule: true,
    })
    .dynamicInclude(doctorScheduleIncludeConfig)
    .fields()
    .execute();

  return doctorSchedule;
};
const getAllDoctorSchedules = async (query: IQueryParams) => {
  const queryBuilder = new QueryBuilder<
    DoctorSchedules,
    Prisma.DoctorSchedulesWhereInput,
    Prisma.DoctorSchedulesInclude
  >(prisma.doctorSchedules, query, {
    searchableFields: doctorScheduleSearchableFields,
    filterableFields: doctorScheduleFilterableFields,
  });

  const result = await queryBuilder
    .search()
    .filter()
    .sort()
    .paginate()
    .dynamicInclude(doctorScheduleIncludeConfig)
    .sort()
    .fields()
    .execute();

  return result;
};
const getDoctorScheduleById = async (doctorId: string, scheduleId: string) => {
  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId,
        scheduleId,
      },
    },
    include: {
      schedule: true,
      doctor: true,
    },
  });
  return doctorSchedule;
};
const updateMyDoctorSchedule = async (
  user: IRequestUser,
  payload: IUpdateDoctorSchedulePayload,
) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const deleteIds = payload.scheduleIds
    .filter((scheduleId) => {
      return scheduleId.shouldDelete;
    })
    .map((scheduleId) => {
      return scheduleId.id;
    });

  const createIds = payload.scheduleIds
    .filter((scheduleId) => {
      return !scheduleId.shouldDelete;
    })
    .map((scheduleId) => {
      return scheduleId.id;
    });

  const result = await prisma.$transaction(async (tx) => {
    await tx.doctorSchedules.deleteMany({
      where: {
        doctorId: doctorData.id,
        scheduleId: {
          in: deleteIds,
        },
      },
    });
    const result = await tx.doctorSchedules.createMany({
      data: createIds.map((scheduleId) => {
        return {
          doctorId: doctorData.id,
          scheduleId,
        };
      }),
    });
    return result;
  });
  return result;
};
const deleteMyDoctorSchedule = async (id: string, user: IRequestUser) => {
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const result = await prisma.doctorSchedules.deleteMany({
    where: {
      isBooked: false,
      doctorId: doctorData.id,
      scheduleId: id,
    },
  });
  return result;
};

export const DoctorScheduleService = {
  createMyDoctorSchedule,
  getMyDoctorSchedules,
  getAllDoctorSchedules,
  getDoctorScheduleById,
  updateMyDoctorSchedule,
  deleteMyDoctorSchedule,
};
