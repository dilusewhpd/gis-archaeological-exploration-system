import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validateParams =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    try {
      req.validatedParams = schema.parse(req.params);

      next();
    } catch (error) {
      next(error);
    }
};