/*
model Doctor{
    id String @id @default(uuid(7))

    name String 
    email String @unique
    profilePhoto String?
    contactNumber String?
    address String?
    isDeleted Boolean @default(false)
    deletedAt DateTime?
    registrationNumber String @unique
    experience Int @default(0)
    gender Gender
    appointmentFee Float
    qualification String
    currentWorkingPlace String
    designation String
    averageRating Float @default(0.0)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    doctorSpecialities DoctorSpeciality[]

userId String @unique
user User @relation(fields: [userId], references: [id], onDelete: Cascade, onUpdate: Cascade)

@@index([email], name:"idx_doctors_email")
@@index([isDeleted],name:"idx_doctors_isDeleted")

@@map("doctors")
    
}*/

import { Gender } from "../../../generated/prisma/enums";

export interface IUpdateDoctorPayload {
  name?: string;
  profilePhoto?: string;
  contactNumber?: string;
  address?: string;
  registrationNumber?: string;
  experience?: number;
  gender?: Gender;
  appointmentFee?: number;
  qualification?: string;
  currentWorkingPlace?: string;
  designation?: string;
  averageRating?: number;
  specialities?: string[];
}
