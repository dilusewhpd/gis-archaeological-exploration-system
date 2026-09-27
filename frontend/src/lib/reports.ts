import { ApiError, getStoredToken } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface DownloadedReport {
  filename: string;
}

/**
 * Fetches a report PDF from the given backend endpoint and triggers a real
 * browser save — the backend streams a freshly generated PDF each time, so
 * there is never a history to fetch, only the download itself.
 */
async function downloadReport(endpoint: string, fallbackFilename: string): Promise<DownloadedReport> {
  const token = getStoredToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { headers });

  if (!response.ok) {
    let message = "Failed to generate report.";
    try {
      const data = (await response.json()) as { message?: string };
      if (data?.message) message = data.message;
    } catch {
      // response body wasn't JSON — keep the default message
    }
    throw new ApiError(message, response.status);
  }

  const disposition = response.headers.get("content-disposition") ?? "";
  const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
  const filename = filenameMatch?.[1] ?? fallbackFilename;

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);

  return { filename };
}

/** Field officer's "Exploration Log" — GET /api/reports/my-sites. */
export function downloadMySitesReport(): Promise<DownloadedReport> {
  return downloadReport("/api/reports/my-sites", "exploration-log.pdf");
}

/** Senior officer's "Review Log" — GET /api/reports/my-reviews. */
export function downloadMyReviewsReport(): Promise<DownloadedReport> {
  return downloadReport("/api/reports/my-reviews", "review-log.pdf");
}

/** Analyst's "Risk Assessment Report" — GET /api/reports/risk-assessment. */
export function downloadRiskAssessmentReport(): Promise<DownloadedReport> {
  return downloadReport("/api/reports/risk-assessment", "risk-assessment-report.pdf");
}
