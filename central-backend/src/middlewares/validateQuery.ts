import { RequestHandler } from "express";
import { ZodSchema } from "zod";

export const validateQuery =
  <T>(schema: ZodSchema<T>): RequestHandler =>
  (req, res, next) => {
    try {
      req.validatedQuery = schema.parse(req.query);
      next();
    } catch (err) {
      next(err);
    }
  };