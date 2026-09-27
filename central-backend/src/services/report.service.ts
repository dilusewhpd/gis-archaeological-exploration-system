import PDFDocument from "pdfkit";
import { prisma } from "../config/prismaDb.js";

/**
 * Palette mirrors the frontend's design system (see the field officer
 * dashboard / SiteDetailView Tailwind colors) so the PDF and the web app
 * read as the same product.
 */
const COLORS = {
  ink: "#3A2A12",
  gold: "#BB892C",
  body: "#3A4048",
  muted: "#5B6472",
  faint: "#8A8478",
  border: "#DEDBD1",
};

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: "#EFEEEA", text: "#5B6472", label: "Draft" },
  PENDING: { bg: "#FBF0EB", text: "#9A5A2E", label: "Pending review" },
  APPROVED: { bg: "#EAF3EA", text: "#2C6B33", label: "Approved" },
  REJECTED: { bg: "#FBEBEA", text: "#B03A2E", label: "Rejected" },
};

const STATUS_ORDER = ["DRAFT", "PENDING", "APPROVED", "REJECTED"] as const;

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 495.28; // A4 width (595.28) minus left+right margins
const CONTENT_RIGHT = PAGE_MARGIN + CONTENT_WIDTH;

/**
 * The document is created with bottom margin 0 (see generateMySitesReportPdf)
 * so pdfkit's own overflow guard never fires while we draw the footer inside
 * the reserved band below CONTENT_BOTTOM — pdfkit auto-inserts a page any
 * time a positioned .text() call lands past its margin boundary, even for
 * absolutely-positioned text that was never meant to flow. CONTENT_BOTTOM is
 * the boundary *we* enforce ourselves in ensureSpace().
 */
const CONTENT_BOTTOM = 841.89 - PAGE_MARGIN;

const formatDate = (date: Date | null | undefined) =>
  date
    ? date.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" })
    : "—";

const formatDateTime = (date: Date) =>
  date.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

type ReportSite = {
  siteCode: string;
  name: string;
  status: string;
  province: string;
  district: string;
  historicalPeriod: string;
  siteType: string;
  submittedAt: Date | null;
  approvedAt: Date | null;
  rejectedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
};

function titleCase(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function drawLetterhead(
  doc: PDFKit.PDFDocument,
  officer: { firstName: string; lastName: string; email: string } | null
) {
  let y = PAGE_MARGIN;

  doc
    .font("Times-Bold")
    .fontSize(18)
    .fillColor(COLORS.ink)
    .text("Department of Archaeology", PAGE_MARGIN, y);

  y += 22;
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.gold)
    .text("SRI LANKA  ·  EXPLORATION DATA MANAGEMENT SYSTEM", PAGE_MARGIN, y, {
      characterSpacing: 0.6,
    });

  y += 20;
  doc.moveTo(PAGE_MARGIN, y).lineTo(CONTENT_RIGHT, y).lineWidth(1.5).strokeColor(COLORS.gold).stroke();

  y += 16;
  doc.font("Times-Bold").fontSize(15).fillColor(COLORS.ink).text("Exploration Log", PAGE_MARGIN, y);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.faint)
    .text(`Generated ${formatDateTime(new Date())}`, PAGE_MARGIN, y + 2, {
      width: CONTENT_WIDTH,
      align: "right",
    });

  y += 20;
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.muted)
    .text(
      officer
        ? `Prepared for ${officer.firstName} ${officer.lastName} (${officer.email})`
        : "Prepared for this officer",
      PAGE_MARGIN,
      y
    );

  y += 18;
  doc.moveTo(PAGE_MARGIN, y).lineTo(CONTENT_RIGHT, y).lineWidth(0.75).strokeColor(COLORS.border).stroke();

  doc.y = y + 16;
}

function drawRunningHeader(doc: PDFKit.PDFDocument) {
  const y = PAGE_MARGIN;
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor(COLORS.ink)
    .text("Department of Archaeology", PAGE_MARGIN, y, { continued: true })
    .font("Helvetica")
    .fillColor(COLORS.faint)
    .text("  ·  Exploration Log", { continued: false });

  doc
    .moveTo(PAGE_MARGIN, y + 14)
    .lineTo(CONTENT_RIGHT, y + 14)
    .lineWidth(0.75)
    .strokeColor(COLORS.border)
    .stroke();

  doc.y = y + 26;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  if (doc.y + needed > CONTENT_BOTTOM) {
    doc.addPage();
    drawRunningHeader(doc);
  }
}

function drawSummary(doc: PDFKit.PDFDocument, sites: ReportSite[]) {
  const counts = sites.reduce<Record<string, number>>((acc, site) => {
    acc[site.status] = (acc[site.status] ?? 0) + 1;
    return acc;
  }, {});

  const columns = [
    { label: "Total sites", value: sites.length, color: COLORS.ink },
    ...STATUS_ORDER.map((key) => ({
      label: STATUS_STYLES[key].label,
      value: counts[key] ?? 0,
      color: STATUS_STYLES[key].text,
    })),
  ];

  const boxHeight = 52;
  const colWidth = CONTENT_WIDTH / columns.length;
  const top = doc.y;

  doc
    .roundedRect(PAGE_MARGIN, top, CONTENT_WIDTH, boxHeight, 4)
    .fillColor("#FAF9F6")
    .fill()
    .roundedRect(PAGE_MARGIN, top, CONTENT_WIDTH, boxHeight, 4)
    .lineWidth(0.75)
    .strokeColor(COLORS.border)
    .stroke();

  columns.forEach((col, i) => {
    const x = PAGE_MARGIN + i * colWidth;

    if (i > 0) {
      doc
        .moveTo(x, top + 10)
        .lineTo(x, top + boxHeight - 10)
        .lineWidth(0.5)
        .strokeColor(COLORS.border)
        .stroke();
    }

    doc
      .font("Times-Bold")
      .fontSize(18)
      .fillColor(col.color)
      .text(String(col.value), x, top + 9, { width: colWidth, align: "center" });

    doc
      .font("Helvetica")
      .fontSize(7.5)
      .fillColor(COLORS.faint)
      .text(col.label.toUpperCase(), x, top + 33, {
        width: colWidth,
        align: "center",
        characterSpacing: 0.3,
      });
  });

  doc.y = top + boxHeight + 22;
}

function drawStatusBadge(doc: PDFKit.PDFDocument, status: string, rightEdge: number, y: number) {
  const style = STATUS_STYLES[status] ?? { bg: "#EFEEEA", text: COLORS.muted, label: status };

  doc.font("Helvetica-Bold").fontSize(8.5);
  const textWidth = doc.widthOfString(style.label);
  const badgeWidth = textWidth + 16;
  const badgeX = rightEdge - badgeWidth;

  doc.roundedRect(badgeX, y, badgeWidth, 16, 3).fillColor(style.bg).fill();
  doc.fillColor(style.text).text(style.label, badgeX, y + 4, { width: badgeWidth, align: "center" });
}

function measureSiteCard(doc: PDFKit.PDFDocument, site: ReportSite): number {
  let height = 14 + 16 + 6; // padding-top + header row + gap
  height += 3 * 13; // location, period/type, submitted lines
  if (site.status === "APPROVED") height += 13;
  if (site.status === "REJECTED") {
    height += 13; // rejected-date line
    const reasonText = `Reason: ${site.rejectionReason ?? "—"}`;
    doc.font("Helvetica").fontSize(9);
    height += doc.heightOfString(reasonText, { width: CONTENT_WIDTH - 28 }) + 2;
  }
  height += 14; // padding-bottom
  return height;
}

function drawSiteCard(doc: PDFKit.PDFDocument, site: ReportSite, cardHeight: number) {
  const top = doc.y;
  const left = PAGE_MARGIN;
  const padX = 14;

  doc
    .roundedRect(left, top, CONTENT_WIDTH, cardHeight, 4)
    .lineWidth(0.75)
    .strokeColor(COLORS.border)
    .stroke();

  let y = top + 12;

  doc
    .font("Times-Bold")
    .fontSize(11.5)
    .fillColor(COLORS.ink)
    .text(site.name, left + padX, y, { width: CONTENT_WIDTH - 28 - 90, ellipsis: true });

  doc
    .font("Helvetica")
    .fontSize(8.5)
    .fillColor(COLORS.faint)
    .text(site.siteCode, left + padX, y + 15);

  drawStatusBadge(doc, site.status, left + CONTENT_WIDTH - padX, top + 12);

  y += 30;

  const lineX = left + padX;
  const lineWidth = CONTENT_WIDTH - padX * 2;

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.body)
    .text(`Location: ${site.district} District, ${site.province} Province`, lineX, y, { width: lineWidth });
  y += 13;

  doc.text(
    `Historical period: ${titleCase(site.historicalPeriod)}    ·    Site type: ${titleCase(site.siteType)}`,
    lineX,
    y,
    { width: lineWidth }
  );
  y += 13;

  doc.text(`Submitted: ${formatDate(site.submittedAt)}`, lineX, y, { width: lineWidth });
  y += 13;

  if (site.status === "APPROVED") {
    doc.fillColor(STATUS_STYLES.APPROVED.text).text(`Approved: ${formatDate(site.approvedAt)}`, lineX, y, {
      width: lineWidth,
    });
    y += 13;
  }

  if (site.status === "REJECTED") {
    doc.fillColor(STATUS_STYLES.REJECTED.text).text(`Rejected: ${formatDate(site.rejectedAt)}`, lineX, y, {
      width: lineWidth,
    });
    y += 13;
    doc
      .fillColor(COLORS.body)
      .text(`Reason: ${site.rejectionReason ?? "—"}`, lineX, y, { width: lineWidth });
  }

  doc.y = top + cardHeight + 12;
}

function drawEmptyState(doc: PDFKit.PDFDocument) {
  const top = doc.y;
  const height = 90;

  doc
    .roundedRect(PAGE_MARGIN, top, CONTENT_WIDTH, height, 4)
    .fillColor("#FAF9F6")
    .fill()
    .roundedRect(PAGE_MARGIN, top, CONTENT_WIDTH, height, 4)
    .lineWidth(0.75)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font("Times-Bold")
    .fontSize(12)
    .fillColor(COLORS.ink)
    .text("No sites submitted yet", PAGE_MARGIN, top + 30, { width: CONTENT_WIDTH, align: "center" });

  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor(COLORS.muted)
    .text(
      "Once you register and submit an exploration site, it will appear in this report.",
      PAGE_MARGIN,
      top + 50,
      { width: CONTENT_WIDTH, align: "center" }
    );

  doc.y = top + height + 16;
}

function drawFooters(doc: PDFKit.PDFDocument) {
  const range = doc.bufferedPageRange();
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);

    const y = doc.page.height - PAGE_MARGIN + 12;
    doc
      .moveTo(PAGE_MARGIN, y - 8)
      .lineTo(CONTENT_RIGHT, y - 8)
      .lineWidth(0.5)
      .strokeColor(COLORS.border)
      .stroke();

    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(COLORS.faint)
      .text("Generated by Exploration Data Management System", PAGE_MARGIN, y, {
        width: CONTENT_WIDTH / 2,
        align: "left",
      })
      .text(`Page ${i - range.start + 1} of ${range.count}`, PAGE_MARGIN + CONTENT_WIDTH / 2, y, {
        width: CONTENT_WIDTH / 2,
        align: "right",
      });
  }
}

export const generateMySitesReportPdf = async (userId: string): Promise<Buffer> => {
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

  const doc = new PDFDocument({
    size: "A4",
    margins: { top: PAGE_MARGIN, bottom: 0, left: PAGE_MARGIN, right: PAGE_MARGIN },
    bufferPages: true,
  });
  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
  });

  drawLetterhead(doc, user);
  drawSummary(doc, sites);

  if (sites.length === 0) {
    drawEmptyState(doc);
  } else {
    sites.forEach((site) => {
      const cardHeight = measureSiteCard(doc, site);
      ensureSpace(doc, cardHeight + 12);
      drawSiteCard(doc, site, cardHeight);
    });
  }

  drawFooters(doc);

  doc.end();
  return done;
};
