import { Role, Speciality } from "../../../generated/prisma/client";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreaeteDoctorPayload } from "./user.interface";

const doctorSelect = {
  id: true,
  name: true,
  email: true,
  profilePhoto: true,
  contactNumber: true,
  address: true,
  registrationNumber: true,
  experience: true,
  gender: true,
  appointmentFee: true,
  qualification: true,
  currentWorkingPlace: true,
  designation: true,
  averageRating: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      status: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      isDeleted: true,
      deletedAt: true,
    },
  },
  doctorSpecialities: {
    select: {
      speciality: {
        select: {
          id: true,
          title: true,
          description: true,
          icon: true,
        },
      },
    },
  },
};

const createDoctor = async (payload: ICreaeteDoctorPayload) => {
  const specialities: Speciality[] = [];
  for (const specialityId of payload.specialities) {
    const speciality = await prisma.speciality.findUnique({
      where: {
        id: specialityId,
      },
    });
    if (!speciality) {
      throw new Error(`Speciality with id ${specialityId} not found`);
    }
    specialities.push(speciality);
  }

  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });

  if (userExists) {
    throw new Error(`User with email ${payload.doctor.email} already exists`);
  }

  const userData = await auth.api.signUpEmail({
    body: {
      email: payload.doctor.email,
      password: payload.password,
      role: Role.DOCTOR,
      name: payload.doctor.name,
      needPasswordChange: true,
    },
  });

  try {
    const result = await prisma.$transaction(async (tx) => {
      const doctorData = await tx.doctor.create({
        data: {
          userId: userData.user.id,
          ...payload.doctor,
        },
      });
      const doctorSpecialityData = specialities.map((specialiyty) => {
        return {
          doctorId: doctorData.id,
          specialityId: specialiyty.id,
        };
      });

      await tx.doctorSpeciality.createMany({
        data: doctorSpecialityData,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: doctorSelect,
      });
      return doctor;
    });
    return result;
  } catch (error) {
    console.log("Transaction Error: ", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

const getDoctor = async (id: string) => {
  const doctor = await prisma.doctor.findFirst({
    where: {
      id,
      isDeleted: false,
    },
    select: doctorSelect,
  });

  if (!doctor) {
    throw new Error("Doctor not found");
  }

  return doctor;
};

export const userService = {
  createDoctor,
  getDoctor,
};
