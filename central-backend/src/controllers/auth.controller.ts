import { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service.js";

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.register(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    console.log(req.body);
    const result = await authService.login(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const me = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await authService.getCurrentUser(req.user!.userId);

    res.status(200).json({
      success: true,
      message: "Current user retrieved successfully.",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};