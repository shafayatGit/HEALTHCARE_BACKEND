import { prisma } from "../../lib/prisma";

const getAllAdmin = async () => {
  const result = await prisma.admin.findMany({
    include: {
      user: true,
    },
  });
  return result;
};

const getAdminById = async (id: string) => {
  const result = await prisma.admin.findUnique({
    where: {
      id,
    },
    include: {
      user: true,
    },
  });
  return result;
};

export const adminServices = {
  getAllAdmin,
  getAdminById,
};
