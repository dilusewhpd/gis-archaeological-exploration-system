import { z } from "zod";
import { ROLES } from "../utils/constants/auth.constants.js";

export const createUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  lastName: z
    .string()
    .trim()
    .min(2)
    .max(100),

  email: z
    .email()
    .trim()
    .toLowerCase(),

  role: z.enum([
    ROLES.ADMIN,
    ROLES.ANALYST,
    ROLES.FIELD_OFFICER,
  ]),
});

export type CreateUserInput =
  z.infer<typeof createUserSchema>;