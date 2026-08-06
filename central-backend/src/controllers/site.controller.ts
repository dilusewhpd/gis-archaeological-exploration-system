import { Request, Response, NextFunction } from "express";
import { CreateSiteData, GetSitesQuery, RejectSiteData, SiteIdParam, UpdateSiteData } from "../moduleTypes/sites/sites.types.js";
import { approveSite, createSite, getSiteById, getSites, rejectSite, submitSite, updateSite } from "../services/site.service.js";

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


export const getSiteByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as SiteIdParam;

    const site = await getSiteById(id);

    return res.status(200).json({
      success: true,
      message: "Site retrieved successfully.",
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

export const updateSiteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as SiteIdParam;

    const data = req.body as UpdateSiteData;

    const site = await updateSite(
      id,
      data,
      req.user!.userId,
      req.user!.role
    );

    return res.status(200).json({
      success: true,
      message: "Site updated successfully.",
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

export const submitSiteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as SiteIdParam;

    const site = await submitSite(
      id,
      req.user!.userId,
      req.user!.role
    );

    return res.status(200).json({
      success: true,
      message: "Site submitted successfully.",
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

export const approveSiteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as SiteIdParam;

    const site = await approveSite(
      id,
      req.user!.userId
    );

    return res.status(200).json({
      success: true,
      message: "Site approved successfully.",
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectSiteController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validatedParams as SiteIdParam;

    const data = req.body as RejectSiteData;

    const site = await rejectSite(
      id,
      data,
      req.user!.userId
    );

    return res.status(200).json({
      success: true,
      message: "Site rejected successfully.",
      data: site,
    });
  } catch (error) {
    next(error);
  }
};

export const getMySitesController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getSites(
      req.query as GetSitesQuery,
      req.user!.userId
    );

    return res.status(200).json({
      success: true,
      message: "My sites retrieved successfully.",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};