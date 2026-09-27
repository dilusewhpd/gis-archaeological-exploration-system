import { Request, Response, NextFunction } from "express";
import { generateMySitesReportPdf } from "../services/report.service.js";

export const getMySitesReportController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const pdfBuffer = await generateMySitesReportPdf(req.user!.userId);

    const date = new Date().toISOString().slice(0, 10);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="exploration-log-${date}.pdf"`
    );
    res.status(200).send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};
