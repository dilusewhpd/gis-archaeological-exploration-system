import { NextFunction, Request, Response } from "express";

import * as userService from "../services/user.service.js";
import { GetUsersQuery } from "../validators/user.validation.js";

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

export const getUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const query = req.validatedQuery as GetUsersQuery;

	const result = await userService.getUsers(query);
	
    res.status(200).json({
      success: true,
      message: "Users retrieved successfully.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};