import PDFDocument from "pdfkit";
import { prisma } from "../config/prismaDb.js";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

const formatDate = (date: Date | null | undefined) =>
  date
    ? date.toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "—";

export const generateMySitesReportPdf = async (
  userId: string
): Promise<Buffer> => {
  const [user, sites] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, email: true },
    }),
    prisma.site.findMany({
      where: { createdById: userId },
      select: {
        siteCode: true,
        name: true,
        status: true,
        province: true,
        district: true,
        historicalPeriod: true,
        siteType: true,
        submittedAt: true,
        approvedAt: true,
        rejectedAt: true,
        rejectionReason: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const counts = sites.reduce<Record<string, number>>((acc, site) => {
    acc[site.status] = (acc[site.status] ?? 0) + 1;
    return acc;
  }, {});

  const doc = new PDFDocument({ size: "A4", margin: 50 });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  doc.fontSize(18).text("Exploration Log", { align: "left" });
  doc
    .fontSize(10)
    .fillColor("#5B6472")
    .text(
      `Generated ${new Date().toLocaleString("en-GB")} for ${
        user ? `${user.firstName} ${user.lastName} (${user.email})` : "this officer"
      }`
    );
  doc.moveDown(1);

  doc
    .fontSize(12)
    .fillColor("#000000")
    .text(
      `Total sites: ${sites.length}    |    ` +
        Object.entries(STATUS_LABELS)
          .map(([key, label]) => `${label}: ${counts[key] ?? 0}`)
          .join("    ")
    );
  doc.moveDown(1);

  if (sites.length === 0) {
    doc
      .fontSize(12)
      .fillColor("#5B6472")
      .text("No sites submitted yet.");
  } else {
    sites.forEach((site, index) => {
      if (index > 0) doc.moveDown(0.75);

      doc
        .fontSize(13)
        .fillColor("#000000")
        .text(`${site.name}  (${site.siteCode})`);

      doc
        .fontSize(10)
        .fillColor("#333333")
        .text(`Status: ${STATUS_LABELS[site.status] ?? site.status}`)
        .text(`Location: ${site.district} District, ${site.province} Province`)
        .text(
          `Historical period: ${site.historicalPeriod}    Site type: ${site.siteType}`
        )
        .text(`Submitted: ${formatDate(site.submittedAt)}`);

      if (site.status === "APPROVED") {
        doc.text(`Approved: ${formatDate(site.approvedAt)}`);
      }

      if (site.status === "REJECTED") {
        doc
          .text(`Rejected: ${formatDate(site.rejectedAt)}`)
          .text(`Reason: ${site.rejectionReason ?? "—"}`);
      }

      doc
        .moveTo(doc.x, doc.y + 4)
        .lineTo(545, doc.y + 4)
        .strokeColor("#DEDBD1")
        .stroke();
    });
  }

  doc.end();
  return done;
};
