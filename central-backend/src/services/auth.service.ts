import bcrypt from "bcrypt";
import { prisma } from "../config/prismaDb.js";
import { RegisterInput } from "../modules/auth/auth.validation.js";
import { ROLES } from "../utils/constants/auth.constants.js";

export const register = async (data: RegisterInput) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingUser) {
    throw new Error("Email is already registered.");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const role = await prisma.role.findUnique({
    where: {
      name: ROLES.FIELD_OFFICER,
    },
  });

  if (!role) {
    throw new Error("Default role not found.");
  }

  const user = await prisma.user.create({
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      passwordHash: hashedPassword,
      roleId: role.id,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      createdAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return user;
};