import { Router } from "express";
import { login, me, register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { loginSchema, registerSchema } from "../modules/auth/auth.validation.js";
import { authenticate } from "../middlewares/authenticate.js";

const router: ReturnType<typeof Router> = Router();

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;