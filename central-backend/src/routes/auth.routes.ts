import { Router } from "express";
import { register } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerSchema } from "../modules/auth/auth.validation.js";

const router: ReturnType<typeof Router> = Router();

router.post("/register", validate(registerSchema), register);

export default router;