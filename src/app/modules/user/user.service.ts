import status from "http-status";
import { Role, Speciality } from "../../../generated/prisma/client";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreaeteDoctorPayload, ICreateAdminPayload } from "./user.interface";

export const doctorSelect = {
  id: true,
  userId: true,
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
  specilities: {
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
      throw new AppError(
        status.NOT_FOUND,
        `Speciality with title ${specialityId} not found`,
      );
    }
    specialities.push(speciality);
  }

  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.doctor.email,
    },
  });

  if (userExists) {
    throw new AppError(
      status.BAD_REQUEST,
      `User with email ${payload.doctor.email} already exists`,
    );
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
      const doctorSpecialityData = specialities.map((speciality) => {
        return {
          doctorId: doctorData.id,
          specialtyId: speciality.id,
        };
      });

      await tx.doctorSpeciality.createMany({
        data: doctorSpecialityData,
      });

      const doctor = await tx.doctor.findUnique({
        where: {
          id: doctorData.id,
        },
        select: {
          id: true,
          userId: true,
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
          specialties: {
            select: {
              specialty: {
                select: {
                  id: true,
                  title: true,
                  description: true,
                  icon: true,
                },
              },
            },
          },
        },
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

const createAdmin = async (payload: ICreateAdminPayload) => {
  //TODO: Validate who is creating the admin user. Only super admin can create admin user and only super admin can create super admin user but admin user cannot create super admin user.

  const userExists = await prisma.user.findUnique({
    where: {
      email: payload.admin.email,
    },
  });

  if (userExists) {
    throw new AppError(status.CONFLICT, "User with this email already exists");
  }

  const { admin, role, password } = payload;

  const userData = await auth.api.signUpEmail({
    body: {
      ...admin,
      password,
      role,
      needPasswordChange: true,
    },
  });

  try {
    const adminData = await prisma.admin.create({
      data: {
        userId: userData.user.id,
        ...admin,
      },
      include: {
        user: true,
      },
    });

    return adminData;
  } catch (error: any) {
    console.log("Error creating admin: ", error);
    await prisma.user.delete({
      where: {
        id: userData.user.id,
      },
    });
    throw error;
  }
};

export const userService = {
  createDoctor,
  createAdmin,
};
