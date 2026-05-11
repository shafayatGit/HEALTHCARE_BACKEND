import z from "zod";
import { Gender } from "../../../generated/prisma/enums";
export const updateDoctorValidationSchema = z
  .object({
    body: z.object({
      name: z.string(),
      profilePhoto: z.url("Invalid URL format"),
      contactNumber: z.string(),
      registrationNumber: z.string(),
      experience: z
        .int("Experience must be a whole number")
        .min(0, "Experience cannot be negative"),
      gender: z.enum([Gender.MALE, Gender.FEMALE]),
      appointmentFee: z.number().positive("Appointment fee must be positive"),
      qualification: z.string(),
      currentWorkingPlace: z.string(),
      designation: z.string(),
      specialties: z.array(z.uuid("Each specialty ID must be a valid UUID")),
    }),
  })
  .partial();

export const DoctorValidation = {
  updateDoctorValidationSchema,
};
