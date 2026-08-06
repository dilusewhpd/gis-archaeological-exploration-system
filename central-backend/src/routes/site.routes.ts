import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { validate } from "../middlewares/validate.js";
import { createSiteSchema } from "../validators/sites/create-site.validation.js";
import { createSiteController, getSiteByIdController, getSitesController, submitSiteController, updateSiteController } from "../controllers/site.controller.js";
import { ROLES } from "../utils/constants/auth.constants.js";
import { getSitesQuerySchema } from "../validators/sites/get-sites.validation.js";
import { validateQuery } from "../middlewares/validateQuery.js";
import { validateParams } from "../middlewares/validateParams.js";
import { siteIdParamSchema, updateSiteSchema } from "../validators/sites/index.js";

const router: ReturnType<typeof Router> = Router();

router.post(
    "/",
    authenticate,
    authorize(ROLES.FIELD_OFFICER, ROLES.SENIOR_OFFICER),
    validate(createSiteSchema),
    createSiteController,
);

router.get(
  "/",
  authenticate,
  authorize(
    ROLES.SENIOR_OFFICER,
    ROLES.FIELD_OFFICER,
    ROLES.ANALYST,
  ),
  validateQuery(getSitesQuerySchema),
  getSitesController
);

router.get(
  "/:id",
  authenticate,
  authorize(
    ROLES.ADMIN,
    ROLES.SENIOR_OFFICER,
    ROLES.FIELD_OFFICER,
    ROLES.ANALYST,
  ),
  validateParams(siteIdParamSchema),
  getSiteByIdController
);

router.put(
  "/:id",
  authenticate,
  authorize(
    ROLES.ADMIN,
    ROLES.SENIOR_OFFICER,
    ROLES.FIELD_OFFICER
  ),
  validateParams(siteIdParamSchema),
  validate(updateSiteSchema),
  updateSiteController
);

router.post(
  "/:id/submit",
  authenticate,
  authorize(
    ROLES.ADMIN,
    ROLES.SENIOR_OFFICER,
    ROLES.FIELD_OFFICER
  ),
  validateParams(siteIdParamSchema),
  submitSiteController
);

export default router;
