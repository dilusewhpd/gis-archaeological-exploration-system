import { ApiError, getStoredToken } from "@/lib/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

export interface DownloadedReport {
  filename: string;
}

/**
 * Downloads the field officer's "Exploration Log" PDF from
 * GET /api/reports/my-sites and triggers a real browser save — the backend
 * streams a freshly generated PDF, so there is no history to fetch.
 */
export async function downloadMySitesReport(): Promise<DownloadedReport> {
  const token = getStoredToken();
  const headers = new Headers();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_BASE_URL}/api/reports/my-sites`, {
    headers,
  });

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
  const filename = filenameMatch?.[1] ?? "exploration-log.pdf";

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
