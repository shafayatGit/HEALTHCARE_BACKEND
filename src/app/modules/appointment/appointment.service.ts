import { uuidv7 } from "zod";
import {
  AppointmentStatus,
  PaymentStatus,
  Role,
} from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { prisma } from "../../lib/prisma";
import { IBookAppointmentPayload } from "./appointment.interface";
import { stripe } from "../../config/stripe.config";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";

const bookAppointment = async (
  payload: IBookAppointmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: payload.doctorId,
        scheduleId: doctorSchedule.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    //TODO:Payment intergration will be here and payment status will be updated.
    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        transactionId,
        amount: doctorData.appointmentFee,
        appointmentId: appointmentData.id,
      },
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "bdt",
            product_data: {
              name: `Appointment with Dr.${doctorData.name} Fee`,
            },
            unit_amount: doctorData.appointmentFee * 120,
          },
          quantity: 1,
        },
      ],
      metadata: {
        appointmentId: appointmentData.id,
        paymentId: paymentData.id,
      },
      success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
      cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
    });

    return { appointmentData, paymentData, paymentUrl: session.url };
  });

  return {
    appointment: result.appointmentData,
    payment: result.paymentData,
    paymentUrl: result.paymentUrl,
  };
};

//Book appointment but pay later
const bookAppointmentWithPayLater = async (
  payload: IBookAppointmentPayload,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });
  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: payload.doctorId,
      isDeleted: false,
    },
  });

  const scheduleData = await prisma.schedule.findUniqueOrThrow({
    where: {
      id: payload.scheduleId,
    },
  });

  const doctorSchedule = await prisma.doctorSchedules.findUniqueOrThrow({
    where: {
      doctorId_scheduleId: {
        doctorId: doctorData.id,
        scheduleId: scheduleData.id,
      },
    },
  });

  const videoCallingId = String(uuidv7());

  const result = await prisma.$transaction(async (tx) => {
    const appointmentData = await tx.appointment.create({
      data: {
        patientId: patientData.id,
        doctorId: payload.doctorId,
        scheduleId: doctorSchedule.scheduleId,
        videoCallingId,
      },
    });

    await tx.doctorSchedules.update({
      where: {
        doctorId_scheduleId: {
          doctorId: payload.doctorId,
          scheduleId: payload.scheduleId,
        },
      },
      data: {
        isBooked: true,
      },
    });

    const transactionId = String(uuidv7());
    const paymentData = await tx.payment.create({
      data: {
        transactionId,
        amount: doctorData.appointmentFee,
        appointmentId: appointmentData.id,
      },
    });

    return {
      appointment: appointmentData,
      payment: paymentData,
    };
  });
  return result;
};

const initiatePayment = async (appointmentId: string, user: IRequestUser) => {
  const patintData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
      patientId: patintData.id,
    },
    include: {
      payment: true,
      doctor: true,
    },
  });

  if (appointmentData.payment?.status === PaymentStatus.PAID) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already paid for this appointment",
    );
  }

  if (appointmentData.status === AppointmentStatus.CANCELED) {
    throw new AppError(
      status.BAD_REQUEST,
      "You have already canceled this appointment",
    );
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "bdt",
          product_data: {
            name: `Appointment with Dr.${appointmentData.doctor.name} Fee`,
          },
          unit_amount: appointmentData.doctor.appointmentFee * 120,
        },
        quantity: 1,
      },
    ],
    metadata: {
      appointmentId: appointmentData.id,
      paymentId: appointmentData.payment?.id as string,
    },
    success_url: `${envVars.FRONTEND_URL}/dashboard/payment/payment-success`,
    cancel_url: `${envVars.FRONTEND_URL}/dashboard/appointments`,
  });

  return {
    appointment: appointmentData,
    payment: appointmentData.payment,
    paymentUrl: session.url,
  };
};

const getMyAppointments = async (user: IRequestUser) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user?.email,
      isDeleted: false,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      id: user?.email,
      isDeleted: false,
    },
  });

  let appointments = [];
  if (patientData) {
    appointments = await prisma.appointment.findMany({
      where: {
        patientId: patientData.id,
      },
      include: {
        doctor: true,
        schedule: true,
        patient: true,
        review: true,
      },
    });
  } else if (doctorData) {
    appointments = await prisma.appointment.findMany({
      where: {
        doctorId: doctorData.id,
      },
      include: {
        doctor: true,
        schedule: true,
        patient: true,
        review: true,
      },
    });
  } else {
    throw new Error("User not found");
  }

  return appointments;
};

const getAllAppointments = async () => {
  const appointments = await prisma.appointment.findMany({
    include: {
      doctor: true,
      schedule: true,
      patient: true,
      review: true,
    },
  });
  return appointments;
};
const changeAppointmentStatus = async (
  appointmentId: string,
  appointmentStatus: AppointmentStatus,
  user: IRequestUser,
) => {
  const appointmentData = await prisma.appointment.findUniqueOrThrow({
    where: {
      id: appointmentId,
    },
    include: {
      patient: true,
      schedule: true,
      doctor: true,
    },
  });

  if (!appointmentData) {
    throw new Error("Appointment not found");
  }

  if (user?.role === Role.DOCTOR) {
    if (user?.email !== appointmentData?.doctor?.email) {
      throw new Error("You are not authorized to cancel this appointment");
    }

    await prisma.appointment.update({
      where: {
        id: appointmentId,
      },
      data: {
        status: appointmentStatus,
      },
    });
  }
};

const getMySingleAppointment = async (
  appointmentId: string,
  user: IRequestUser,
) => {
  const patientData = await prisma.patient.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  const doctorData = await prisma.doctor.findUniqueOrThrow({
    where: {
      email: user.email,
    },
  });

  let appointment;
  if (patientData) {
    appointment = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
        schedule: true,
        doctor: true,
      },
    });
  } else if (doctorData) {
    appointment = await prisma.appointment.findUniqueOrThrow({
      where: {
        id: appointmentId,
      },
      include: {
        patient: true,
        schedule: true,
        doctor: true,
      },
    });
  } else {
    throw new Error("User not found");
  }
  return appointment;
};

const cancelUnpaidAppointments = async (
  appointmentId: string,
  appointmentStatus: AppointmentStatus,
  user: IRequestUser,
) => {
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  const unpaidAppointments = await prisma.appointment.findMany({
    where: {
      status: AppointmentStatus.SCHEDULED,
      createdAt: {
        lt: thirtyMinutesAgo,
      },
    },
    include: {
      patient: true,
      schedule: true,
      doctor: true,
    },
  });

  const appointmentToCancel = unpaidAppointments.map(
    (appointment) => appointment.id,
  );

  await prisma.$transaction(async (tx) => {
    await tx.appointment.updateMany({
      where: {
        id: {
          in: appointmentToCancel,
        },
      },
      data: {
        status: AppointmentStatus.CANCELED,
      },
    });

    await tx.payment.deleteMany({
      where: {
        appointmentId: {
          in: appointmentToCancel,
        },
      },
    });
    for (const unpaidAppointment of unpaidAppointments) {
      await tx.doctorSchedules.update({
        where: {
          doctorId_scheduleId: {
            doctorId: unpaidAppointment.doctorId,
            scheduleId: unpaidAppointment.scheduleId,
          },
        },
        data: {
          isBooked: false,
        },
      });
    }
  });
};

export const AppointmentService = {
  bookAppointment,
  changeAppointmentStatus,
  getMyAppointments,
  getMySingleAppointment,
  getAllAppointments,
  bookAppointmentWithPayLater,
  initiatePayment,
  cancelUnpaidAppointments,
};
