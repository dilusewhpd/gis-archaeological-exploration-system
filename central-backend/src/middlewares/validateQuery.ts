import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateQuery =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      const parsedQuery = schema.parse(req.query) as Request["query"];
      req.query = parsedQuery;

      next();
    } catch (error) {
      next(error);
    }
  };