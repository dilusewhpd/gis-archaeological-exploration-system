import { apiRequest, type ApiResponse } from "@/lib/api";

/**
 * Client for GET /api/sites/:id/risk — proxies to the Python risk-assessment
 * microservice (risk_service.py). Only APPROVED sites have a risk profile;
 * the backend returns a 422 for anything else and a 503 if the Python
 * service isn't reachable.
 */

export type RiskLabel = "Low" | "Medium" | "High";

export interface SiteRiskAssessment {
  risk_label: RiskLabel;
  /** 0-100 continuous heuristic score — display verbatim, don't re-derive it. */
  risk_score: number;
  probabilities: Record<RiskLabel, number>;
  climate_zone: string;
  elevation_m: number;
  distance_to_coast_km: number;
  model_note: string;
}

/** Blue-to-red scale, deliberately distinct from the green/amber/red site-status colors. */
export const RISK_LABEL_COLOR: Record<RiskLabel, string> = {
  Low: "#2E6B9A",
  Medium: "#C9722E",
  High: "#8A2418",
};

export async function getSiteRisk(id: string): Promise<SiteRiskAssessment> {
  const res = await apiRequest<ApiResponse<SiteRiskAssessment>>(`/api/sites/${id}/risk`);
  return res.data;
}
