import { Router } from "express";
import { login, register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../modules/auth/auth.validation.js";

const router: ReturnType<typeof Router> = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
export default router;