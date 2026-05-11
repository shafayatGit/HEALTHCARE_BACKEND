import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { IUpdateDoctorPayload } from "./doctor.interface";

const getAllDoctors = async () => {
  const doctors = await prisma.doctor.findMany({
    include: {
      user: true,
      doctorSpecialities: true,
    },
  });
  return doctors;
};

const getDoctorById = async (id: string) => {
  const doctor = await prisma.doctor.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
      doctorSpecialities: true,
    },
  });
  return doctor;
};

const updateDoctor = async (id: string, payload: IUpdateDoctorPayload) => {
  // Check if doctor exist
  const doctorExist = await prisma.doctor.findUnique({
    where: {
      id,
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
      doctorSpecialities: true,
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
        specialityId: speciality,
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
  const doctor = await prisma.doctor.update({
    where: {
      id,
    },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  return doctor;
};
export const doctorService = {
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  softDeleteDoctor,
};
