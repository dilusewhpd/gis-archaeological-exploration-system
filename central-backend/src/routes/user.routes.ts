import { Router } from "express";
import { createUser, getUsers } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { ROLES } from "../utils/constants/auth.constants.js";
import { createUserSchema, getUsersQuerySchema } from "../validators/user.validation.js";
import { validateQuery } from "../middlewares/validateQuery.js";

const router: ReturnType<typeof Router> = Router();

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createUserSchema),
  createUser
);

router.get(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validateQuery(getUsersQuerySchema),
  getUsers
);

export default router;