import { Request, Response, NextFunction } from "express";
import { CreateSiteData, GetSitesQuery } from "../moduleTypes/sites/sites.types.js";
import { createSite, getSites } from "../services/site.service.js";

export const createSiteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = req.body as CreateSiteData;

    const site = await createSite(
      data,
      req.user!.userId
    );

    return res.status(201).json({
      success: true,
      message: "Site created successfully.",
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

export const getSitesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sites = await getSites(
      req.query as GetSitesQuery
    );

    return res.status(200).json({
      success: true,
      message: "Sites retrieved successfully.",
      ...sites,
    });
  } catch (error) {
    next(error);
  }
};