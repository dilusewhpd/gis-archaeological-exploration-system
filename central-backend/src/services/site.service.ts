import { Prisma } from "@prisma/client";
import { prisma } from "../config/prismaDb.js";
import { ConflictError, NotFoundError } from "../errors/customErrors.js";
import { CreateSiteData, GetSitesQuery } from "../moduleTypes/sites/sites.types.js";

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

export const getSites = async (
  query: GetSitesQuery
) => {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  const sortBy = ("sortBy" in query && query.sortBy) ? query.sortBy : "createdAt";
  const sortOrder = ("sortOrder" in query && query.sortOrder) ? query.sortOrder : "desc";

  const {
    search,
    status,
    historicalPeriod,
    siteType,
    province,
    district,
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.SiteWhereInput = {
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
        {
          siteCode: {
            contains: search,
            mode: Prisma.QueryMode.insensitive,
          },
        },
      ],
    }),

    ...(status && { status }),

    ...(historicalPeriod && { historicalPeriod }),

    ...(siteType && { siteType }),

    ...(province && {
      province: {
        contains: province,
        mode: Prisma.QueryMode.insensitive,
      },
    }),

    ...(district && {
      district: {
        contains: district,
        mode: Prisma.QueryMode.insensitive,
      },
    }),
  };

  const sites = await prisma.site.findMany({
      where,
      skip,
      take: Number(limit),

      orderBy: {
        [sortBy as string]: sortOrder,
      },

      select: {
        id: true,
        siteCode: true,
        name: true,

        province: true,
        district: true,
        divisionalSecretariat: true,

        historicalPeriod: true,
        siteType: true,

        status: true,

        createdAt: true,
        updatedAt: true,

        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },

        approvedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    const total = await prisma.site.count({
      where,
    });

  return {
    data: sites,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getSiteById = async (
  id: string
) => {
  const site = await prisma.site.findUnique({
    where: {
      id,
    },

    select: {
      id: true,
      siteCode: true,
      name: true,
      description: true,

      province: true,
      district: true,
      divisionalSecretariat: true,

      latitude: true,
      longitude: true,

      historicalPeriod: true,
      siteType: true,

      landUse: true,
      terrain: true,

      distanceToRiver: true,
      rainfall: true,
      proximityToDevelopment: true,

      status: true,

      submittedAt: true,
      approvedAt: true,
      rejectedAt: true,
      rejectionReason: true,

      createdAt: true,
      updatedAt: true,

      createdBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      approvedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      updatedBy: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
  });

  if (!site) {
    throw new NotFoundError("Site not found.");
  }

  return site;
};