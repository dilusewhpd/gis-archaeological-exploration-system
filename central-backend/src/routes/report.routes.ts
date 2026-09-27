import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";
import { authorize } from "../middlewares/authorize.js";
import { getMySitesReportController } from "../controllers/report.controller.js";
import { ROLES } from "../utils/constants/auth.constants.js";

const router: ReturnType<typeof Router> = Router();

router.get(
  "/my-sites",
  authenticate,
  authorize(ROLES.FIELD_OFFICER, ROLES.SENIOR_OFFICER),
  getMySitesReportController
);

export default router;
