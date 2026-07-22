import bcrypt from "bcrypt";
import { CreateUserInput, GetUsersQuery } from "../validators/user.validation.js";
import { generateTemporaryPassword } from "../utils/tempPasswordGen.js";
import { prisma } from "../config/prismaDb.js";
import { Prisma } from "@prisma/client";

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

export const getUsers = async (
  query: GetUsersQuery
) => {
  const {
    page,
    limit,
    search,
    role,
    isActive,
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  // Search
  if (search) {
    where.OR = [
      {
        firstName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        lastName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  // Role filter
  if (role) {
    where.role = {
      name: role,
    };
  }

  // Active filter
  if (isActive !== undefined) {
    where.isActive = isActive === "true";
  }

  const [users, totalItems] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
        updatedAt: true,
        role: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    },
  };
};