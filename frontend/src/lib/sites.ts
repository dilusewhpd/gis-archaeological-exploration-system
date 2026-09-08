import { apiRequest, ApiError, type ApiResponse } from "@/lib/api";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";

/**
 * Central-backend site API.
 *
 * Contracts mirror central-backend/src/routes/site.routes.ts +
 * the `createSiteSchema` / `updateSiteSchema` validators.
 */

// Backend SiteStatus enum — note there is no "SUBMITTED"/"NEEDS_CORRECTION".
export type SiteStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface SitePerson {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface SitePhoto {
  id: string;
  imageUrl: string;
  caption: string | null;
  createdAt: string;
  uploadedBy?: SitePerson;
}

export type SiteWorkflowAction =
  | "CREATED"
  | "UPDATED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ARCHIVED";

/**
 * One row from GET /api/sites/:id/history, oldest first (createdAt asc).
 * `remarks` is only populated for REJECTED (the rejection reason).
 */
export interface WorkflowHistoryEntry {
  id: string;
  action: SiteWorkflowAction;
  remarks: string | null;
  createdAt: string;
  performedBy: { id: string; firstName: string; lastName: string } | null;
}

/** Aggregate counts from GET /api/sites/dashboard. */
export interface SiteDashboardStats {
  draft: number;
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

/** Shape returned by GET /api/sites/my-sites (list select). */
export interface SiteListItem {
  id: string;
  siteCode: string;
  name: string;
  province: string;
  district: string;
  divisionalSecretariat: string;
  historicalPeriod: string;
  siteType: string;
  status: SiteStatus;
  createdAt: string;
  updatedAt: string;
  createdBy: SitePerson;
  approvedBy: SitePerson | null;
}

/** Shape returned by GET /api/sites/:id (siteDetailsSelect). */
export interface SiteDetail {
  id: string;
  siteCode: string;
  name: string;
  description: string | null;
  province: string;
  district: string;
  divisionalSecretariat: string;
  latitude: string | number;
  longitude: string | number;
  historicalPeriod: string;
  siteType: string;
  landUse: string;
  terrain: string;
  distanceToRiver: number | null;
  rainfall: number | null;
  proximityToDevelopment: number | null;
  status: SiteStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: SitePerson | null;
  approvedBy: SitePerson | null;
  updatedBy: SitePerson | null;
  photos: SitePhoto[];
}

interface Paginated<T> {
  success: boolean;
  message?: string;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Values held by <SiteForm>; optional numeric fields are kept as raw strings. */
export interface SiteFormValues {
  siteCode: string;
  name: string;
  description: string;
  province: string;
  district: string;
  divisionalSecretariat: string;
  latitude: number | null;
  longitude: number | null;
  historicalPeriod: string;
  siteType: string;
  landUse: string;
  terrain: string;
  distanceToRiver: string;
  rainfall: string;
  proximityToDevelopment: string;
}

/** Build the JSON body for POST /api/sites or PUT /api/sites/:id. */
export function buildSitePayload(v: SiteFormValues): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    siteCode: v.siteCode.trim(),
    name: v.name.trim(),
    province: v.province,
    district: v.district,
    divisionalSecretariat: v.divisionalSecretariat.trim(),
    latitude: v.latitude,
    longitude: v.longitude,
    historicalPeriod: v.historicalPeriod,
    siteType: v.siteType,
    landUse: v.landUse.trim(),
    terrain: v.terrain.trim(),
  };
  if (v.description.trim()) payload.description = v.description.trim();
  if (v.distanceToRiver.trim() !== "") payload.distanceToRiver = Number(v.distanceToRiver);
  if (v.rainfall.trim() !== "") payload.rainfall = Number(v.rainfall);
  if (v.proximityToDevelopment.trim() !== "")
    payload.proximityToDevelopment = Number(v.proximityToDevelopment);
  return payload;
}

/** Prefix a backend-relative asset path (e.g. "/uploads/sites/x.jpg") with the API origin. */
export function siteAssetUrl(path: string): string {
  if (!path) return path;
  return path.startsWith("http") ? path : `${API_BASE}${path}`;
}

export async function listMySites(
  params: { status?: SiteStatus; search?: string } = {}
): Promise<SiteListItem[]> {
  const qs = new URLSearchParams({ limit: "100", sortBy: "updatedAt", sortOrder: "desc" });
  if (params.status) qs.set("status", params.status);
  if (params.search?.trim()) qs.set("search", params.search.trim());
  const res = await apiRequest<Paginated<SiteListItem>>(`/api/sites/my-sites?${qs.toString()}`);
  return res.data;
}

export interface CreatedSite {
  id: string;
  siteCode: string;
  name: string;
  status: SiteStatus;
}

export async function createSite(
  payload: Record<string, unknown>
): Promise<CreatedSite> {
  const res = await apiRequest<ApiResponse<CreatedSite>>("/api/sites", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function getSite(id: string): Promise<SiteDetail> {
  const res = await apiRequest<ApiResponse<SiteDetail>>(`/api/sites/${id}`);
  return res.data;
}

/**
 * GET /api/sites — every site, no ownership filter. Allowed for
 * SENIOR_OFFICER / FIELD_OFFICER / ANALYST; the service applies no
 * role scoping, so a senior officer sees all sites in every status.
 */
export async function listSites(
  params: { status?: SiteStatus; search?: string; limit?: number } = {}
): Promise<SiteListItem[]> {
  const qs = new URLSearchParams({
    limit: String(params.limit ?? 100),
    sortBy: "updatedAt",
    sortOrder: "desc",
  });
  if (params.status) qs.set("status", params.status);
  if (params.search?.trim()) qs.set("search", params.search.trim());
  const res = await apiRequest<Paginated<SiteListItem>>(`/api/sites?${qs.toString()}`);
  return res.data;
}

/**
 * GET /api/sites/:id/history — workflow audit trail, oldest first.
 * FIELD_OFFICER may only read history for sites they created; other roles
 * may read any.
 */
export async function getSiteHistory(id: string): Promise<WorkflowHistoryEntry[]> {
  const res = await apiRequest<ApiResponse<WorkflowHistoryEntry[]>>(
    `/api/sites/${id}/history`
  );
  return res.data;
}

/**
 * GET /api/sites/dashboard — status counts. Scoped to the caller's own
 * sites for FIELD_OFFICER; system-wide for every other role.
 */
export async function getSiteDashboard(): Promise<SiteDashboardStats> {
  const res = await apiRequest<ApiResponse<SiteDashboardStats>>("/api/sites/dashboard");
  return res.data;
}

/** POST /api/sites/:id/approve — PENDING -> APPROVED (SENIOR_OFFICER / ADMIN). */
export async function approveSite(id: string): Promise<SiteDetail> {
  const res = await apiRequest<ApiResponse<SiteDetail>>(`/api/sites/${id}/approve`, {
    method: "POST",
  });
  return res.data;
}

/**
 * POST /api/sites/:id/reject — PENDING -> REJECTED (SENIOR_OFFICER / ADMIN).
 * `rejectionReason` must be 10–1000 characters (rejectSiteSchema).
 */
export async function rejectSite(id: string, rejectionReason: string): Promise<SiteDetail> {
  const res = await apiRequest<ApiResponse<SiteDetail>>(`/api/sites/${id}/reject`, {
    method: "POST",
    body: JSON.stringify({ rejectionReason }),
  });
  return res.data;
}

export async function updateSite(
  id: string,
  payload: Record<string, unknown>
): Promise<SiteDetail> {
  const res = await apiRequest<ApiResponse<SiteDetail>>(`/api/sites/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return res.data;
}

export async function submitSite(id: string): Promise<SiteDetail> {
  const res = await apiRequest<ApiResponse<SiteDetail>>(`/api/sites/${id}/submit`, {
    method: "POST",
  });
  return res.data;
}

export async function uploadSitePhoto(id: string, file: File): Promise<SitePhoto> {
  const form = new FormData();
  form.append("photo", file);
  const res = await apiRequest<ApiResponse<SitePhoto>>(`/api/sites/${id}/photos`, {
    method: "POST",
    body: form,
  });
  return res.data;
}

/**
 * Turn an unknown thrown value into a user-facing message. Prefers per-field
 * Zod errors from the backend `validate` middleware over its generic
 * "Validation failed." envelope.
 */
export function apiErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    const fieldErrors = (err.data as { errors?: { field?: string; message?: string }[] } | undefined)?.errors;
    if (Array.isArray(fieldErrors) && fieldErrors.length > 0) {
      return fieldErrors
        .map((e) => (e.field ? `${e.field}: ${e.message}` : e.message))
        .join(" · ");
    }
    return err.message;
  }
  return "Couldn't reach the server. Check that the backend is running and try again.";
}

export const SITE_STATUS_LABELS: Record<SiteStatus, string> = {
  DRAFT: "Draft",
  PENDING: "Pending review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

/** A field officer may edit a site only in these states (matches updateSite). */
export function isEditable(status: SiteStatus): boolean {
  return status === "DRAFT" || status === "REJECTED";
}

/**
 * A field officer may submit a site for review from DRAFT, or resubmit a
 * REJECTED site after revising it (matches submitSite).
 */
export function isSubmittable(status: SiteStatus): boolean {
  return status === "DRAFT" || status === "REJECTED";
}
