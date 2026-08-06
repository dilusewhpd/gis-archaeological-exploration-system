import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createSiteSchema } from "../validators/sites/create-site.validation.js";
import { createSiteController } from "../controllers/site.controller.js";
import { ROLES } from "../utils/constants/auth.constants.js";

const router: ReturnType<typeof Router> = Router();

router.post(
    "/",
    authenticate,
    authorize(ROLES.FIELD_OFFICER, ROLES.SENIOR_OFFICER),
    validate(createSiteSchema),
    createSiteController,
);

export default router;
