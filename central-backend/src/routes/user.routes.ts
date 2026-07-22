import { Router } from "express";
import { createUser } from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { ROLES } from "../utils/constants/auth.constants.js";
import { createUserSchema } from "../validators/user.validation.js";

const router: ReturnType<typeof Router> = Router();

router.post(
  "/",
  authenticate,
  authorize(ROLES.ADMIN),
  validate(createUserSchema),
  createUser
);

export default router;