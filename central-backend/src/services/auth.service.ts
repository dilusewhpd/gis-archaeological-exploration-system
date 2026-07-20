import bcrypt from "bcrypt";
import { prisma } from "../config/prismaDb.js";
import { LoginInput, RegisterInput } from "../modules/auth/auth.validation.js";
import { ROLES } from "../utils/constants/auth.constants.js";
import { generateAccessToken } from "../config/jwt.js";

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

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      passwordHash: true,
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

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  const passwordMatches = await bcrypt.compare(
    data.password,
    user.passwordHash
  );

  if (!passwordMatches) {
    throw new Error("Invalid email or password.");
  }

  if (!user.isActive) {
    throw new Error("Your account has been deactivated.");
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    role: user.role.name,
  });

  const { passwordHash, ...safeUser } = user;

  return {
    user: safeUser,
    accessToken,
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("User not found.");
  }

  return user;
};