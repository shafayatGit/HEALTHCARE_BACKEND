import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";
import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/quaryBuilder";
import {
  doctorFilterableFields,
  doctorIncludeConfig,
  doctorSearchableFields,
} from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";

const getAllDoctors = async (query: IQueryParams) => {
  // const doctors = await prisma.doctor.findMany({
  //   // where: {
  //   //   isDeleted: false,
  //   // },
  //   // include: {
  //   //   user: true,
  //   //   specialties: true,
  //   // },

  // });
  const queryBuilder = new QueryBuilder<
    Doctor,
    Prisma.DoctorWhereInput,
    Prisma.DoctorInclude
  >(prisma.doctor, query, {
    searchableFields: doctorSearchableFields,
    filterableFields: doctorFilterableFields,
  });
  const result = await queryBuilder
    .search()
    .filter()
    .where({
      isDeleted: false,
    })
    .include({
      user: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    })
    .dynamicInclude(doctorIncludeConfig)
    .paginate()
    .sort()
    .fields()
    .execute();

  return result;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
    include: {
      user: true,
      specialties: true,
      appointments: {
        include: {
          patient: true,
          schedule: true,
          prescription: true,
        },
      },
      doctorSchedules: {
        include: {
          schedule: true,
        },
      },
    },
  });
  return doctor;
};

const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
  // Check if doctor exist
  const doctorExist = await prisma.doctor.findUnique({
    where: {
      id,
      isDeleted: false,
    },
  });
  if (!doctorExist) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }
  //Saparate specialities from payload
  const { specialities, ...doctorData } = payload;
  // If specialities are provided, validate them and get their ids and then update doctor data
  const updateDoctor = await prisma.doctor.update({
    where: { id },
    data: doctorData,
    include: {
      user: true,
      specialties: true,
    },
  });

  // Checking if specialities are provided and then deleing doctor specialities and then creating new doctor specialities
  if (specialities && specialities.length > 0) {
    await prisma.doctorSpeciality.deleteMany({
      where: {
        doctorId: id,
      },
    });

    const doctorSpecialityData = specialities.map((speciality) => {
      return {
        doctorId: id,
        specialtyId: speciality,
      };
    });

    // Create new doctor specialities
    await prisma.doctorSpeciality.createMany({
      data: doctorSpecialityData,
    });
  }

  return updateDoctor;
};

const softDeleteDoctor = async (id: string) => {
  const doctorExist = await prisma.doctor.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!doctorExist) {
    throw new AppError(status.NOT_FOUND, "Doctor not found");
  }

  //updating and deleting all corresponding tables
  await prisma.$transaction(async (tx) => {
    tx.doctor.update({
      where: {
        id: doctorExist.id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    await tx.user.update({
      where: {
        id: doctorExist.id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: UserStatus.DELETED,
      },
    });

    await tx.session.deleteMany({
      where: { userId: doctorExist.userId },
    });

    await tx.doctorSpeciality.deleteMany({
      where: { doctorId: id },
    });
  });

  return { message: "Doctor deleted successfully" };
};
export const doctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor,
};
