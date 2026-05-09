import { prisma } from "../../lib/prisma";
import { doctorSelect } from "../user/user.service";
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
  const doctorExist = await prisma.doctor.findUnique({
    where: {
      id,
    },
  });
  if (!doctorExist) {
    throw new Error("Doctor not found");
  }
  const { specialities, ...doctorData } = payload;
  const updateDoctor = await prisma.doctor.update({
    where: { id },
    data: doctorData,
    include: {
      user: true,
      doctorSpecialities: true,
    },
  });

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
