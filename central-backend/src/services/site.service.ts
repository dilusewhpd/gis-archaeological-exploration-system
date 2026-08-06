import { Prisma, SiteStatus } from "@prisma/client";
import { prisma } from "../config/prismaDb.js";
import { BusinessRuleError, ConflictError, ForbiddenError, NotFoundError } from "../errors/customErrors.js";
import { CreateSiteData, GetSitesQuery, UpdateSiteData } from "../moduleTypes/sites/sites.types.js";
import { ROLES } from "../utils/constants/auth.constants.js";
import { siteDetailsSelect } from "../utils/constants/site.constant.js";
import { ensureSiteStatus } from "../utils/siteStatus.js";

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

    select: siteDetailsSelect
  });

  if (!site) {
    throw new NotFoundError("Site not found.");
  }

  return site;
};

export const updateSite = async (
  id: string,
  data: UpdateSiteData,
  currentUserId: string,
  currentUserRole: string
) => {
  const site = await prisma.site.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      createdById: true,
    },
  });

  if (!site) {
    throw new NotFoundError("Site not found.");
  }

  if (
    currentUserRole === ROLES.FIELD_OFFICER &&
    site.createdById !== currentUserId
  ) {
    throw new ForbiddenError(
      "You can only update sites you created."
    );
  }

  if (currentUserRole === ROLES.ANALYST) {
    throw new ForbiddenError(
      "You are not authorized to update sites."
    );
  }

  if (
    site.status !== SiteStatus.DRAFT &&
    site.status !== SiteStatus.REJECTED
  ) {
    throw new BusinessRuleError(
      "Only draft or rejected sites can be updated."
    );
  }

  const updatedSite = await prisma.site.update({
    where: {
      id,
    },

    data: {
      ...data,
      updatedById: currentUserId,
    },

    select: siteDetailsSelect,
  });

  return updatedSite;
};

export const submitSite = async (
  id: string,
  currentUserId: string,
  currentUserRole: string
) => {
  const site = await prisma.site.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      createdById: true,
    },
  });

  if (!site) {
    throw new NotFoundError("Site not found.");
  }

  // Field Officers can only submit their own sites
  if (
    currentUserRole === ROLES.FIELD_OFFICER &&
    site.createdById !== currentUserId
  ) {
    throw new ForbiddenError(
      "You can only submit sites you created."
    );
  }

  // Analysts cannot submit sites
  if (currentUserRole === ROLES.ANALYST) {
    throw new ForbiddenError(
      "You are not authorized to submit sites."
    );
  }

  // Only DRAFT sites can be submitted
  ensureSiteStatus(
    site.status,
    [SiteStatus.DRAFT],
    "Only draft sites can be submitted."
  );

  const submittedSite = await prisma.site.update({
    where: {
      id,
    },

    data: {
      status: SiteStatus.PENDING,
      submittedAt: new Date(),
      updatedById: currentUserId,
    },

    select: siteDetailsSelect,
  });

  return submittedSite;
};