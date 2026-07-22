import bcrypt from "bcrypt";
import { CreateUserInput } from "../validators/user.validation.js";
import { generateTemporaryPassword } from "../utils/tempPasswordGen.js";
import { prisma } from "../config/prismaDb.js";

export const createUser = async (
  data: CreateUserInput
) => {

  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("Email already exists.");
  }

  const role = await prisma.role.findUnique({
    where: {
      name: data.role,
    },
  });

  if (!role) {
    throw new Error("Role not found.");
  }

  const temporaryPassword =
    generateTemporaryPassword();

  const passwordHash =
    await bcrypt.hash(temporaryPassword, 10);

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash,
      roleId: role.id,
      mustChangePassword: true,
    },

    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      mustChangePassword: true,
      createdAt: true,

      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return {
    user,
    temporaryPassword,
  };
};