import { prisma } from "../config/prismaDb.js";
import { ConflictError } from "../errors/customErrors.js";
import { CreateSiteData } from "../moduleTypes/sites/sites.types.js";

export const createSite = async (
  data: CreateSiteData,
  currentUserId: string
) => {
  const existingSite = await prisma.site.findUnique({
    where: {
      siteCode: data.siteCode,
    },
  });

  if (existingSite) {
    throw new ConflictError(
      `Site with code '${data.siteCode}' already exists.`
    );
  }

  const site = await prisma.site.create({
    data: {
      ...data,

      createdById: currentUserId,
      updatedById: currentUserId,
    },

    include: {
      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  return site;
};