import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";
import { UserStatus } from "../../../generated/prisma/enums";
// import { IQueryParams } from "../../interfaces/query.interface";
import { QueryBuilder } from "../../utils/quaryBuilder";
import {
  doctorFilterableFields,
  doctorIncludeConfig,
  doctorSearchableFields,
} from "./doctor.constant";
import { Doctor, Prisma } from "../../../generated/prisma/client";

type IQueryParams = {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  search?: string;
  filter?: string;

  //filterableFields
  gender?: string;
  experience?: string;
  appointmentFee?: string;
  specialties?: string;

  [key: string]: unknown; //this is for unknown type
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

//for query builder practice
const getAllDoctors = async (query: IQueryParams) => {
  //Step->1: pagination
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  //Step->2: sorting
  const sortBy = query.sortBy || "createdAt";
  const sortOrder = query.sortOrder === "asc" ? "asc" : "desc";

  let orderBy: Record<string, unknown> = {};

  if (sortBy.includes(".")) {
    //nested object
    const [relation, field] = sortBy.split(".");
    orderBy = {
      [relation]: {
        [field]: sortOrder,
      },
    };
  } else {
    orderBy = {
      [sortBy]: sortOrder,
    };
  }

  //Step->3: searching

  const searchCondition: Prisma.DoctorWhereInput[] = [];
  if (query.searchTerm) {
    const searchTerm = query.searchTerm;
    const searchableFields = ["name", "designation"];
    //if we dont take searchable fields array
    // searchCondition.push({
    //   //Searchable Fields
    //   //we will give here those fields which we want to search
    //   name: {
    //     contains: searchTerm as string,
    //     mode: "insensitive",
    //   },
    //   designation: {
    //     contains: searchTerm as string,
    //     mode: "insensitive",
    //   },
    // });

    searchableFields.forEach((feild) => {
      searchCondition.push({
        [feild]: {
          contains: searchTerm as string,
          mode: "insensitive",
        },
      });
    });
  }

  const result = await prisma.doctor.findMany({
    where: {
      OR: searchCondition.length > 0 ? searchCondition : undefined,
    },
    skip,
    take: limit,
    //-> 1 Layer
    // orderBy: {
    //   "name": "desc",
    //   [sortBy]: sortOrder, //dynamic sorting
    // },
    //`-> 2 Layer
    // orderBy: {
    //   user: {
    //     // name:"asc"
    //     [sortBy]: sortOrder, //dynamic sorting with nested field exmple user.name => orderBy: { user: { name: 'asc' } }
    //   },
    // },
    orderBy,
  });

  return {
    data: result,
    meta: {
      page,
      limit,
      total: result.length,
      totalPages: Math.ceil(result.length / limit),
    },
  };
};
export const doctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor,
};
