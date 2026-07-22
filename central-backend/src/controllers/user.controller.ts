import { NextFunction, Request, Response } from "express";

import * as userService from "../services/user.service.js";

export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {

  try {

    const result =
      await userService.createUser(req.body);

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: result,
    });

  } catch (error) {
    next(error);
  }

};