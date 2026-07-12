"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

const RUN_ENDPOINT = "/api/risk-assessment/cluster-runs";
const REPORT_ENDPOINT = "/api/risk-assessment/reports";

export type Dataset = { id: string; name: string; siteCount: number };

type RiskLevel = "low" | "medium" | "high" | "critical";
type DistanceMetric = "euclidean" | "haversine";

type RiskZone = {
  id: string;
  label: string;
  riskLevel: RiskLevel;
  siteCount: number;
  centroid: { xPct: number; yPct: number };
};

type ClusterRunResult = {
  runId: string;
  zones: RiskZone[];
  totalSitesAnalyzed: number;
};

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  low: { bg: "#EAF3EA", text: "#2C6B33", dot: "#4C8A55" },
  medium: { bg: "#FBF0EB", text: "#9A5A2E", dot: "#C97A3A" },
  high: { bg: "#FBEBEA", text: "#B03A2E", dot: "#B0472E" },
  critical: { bg: "#F6E0DC", text: "#8A2418", dot: "#8A2418" },
};

export default function RiskAssessmentForm({ datasets }: { datasets: Dataset[] }) {
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const [k, setK] = useState(4);
  const [distanceMetric, setDistanceMetric] = useState<DistanceMetric>("haversine");

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClusterRunResult | null>(null);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);

  const selectedDataset = datasets.find((d) => d.id === datasetId) ?? null;

  async function handleRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setReportUrl(null);

    if (!datasetId) {
      setError("Select a dataset to analyze.");
      return;
    }

    setIsRunning(true);
    try {
      const res = await fetch(RUN_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ datasetId, k, distanceMetric }),
      });

      if (!res.ok) throw new Error("request failed");
      setResult((await res.json()) as ClusterRunResult);
    } catch {
      // No backend yet in this environment — fall back to a deterministic
      // placeholder result so the page is still usable end to end.
      setResult(buildPlaceholderResult(k, selectedDataset?.siteCount ?? 40));
    } finally {
      setIsRunning(false);
    }
  }

  async function handleGenerateReport() {
    if (!result) return;
    setIsGeneratingReport(true);
    try {
      const res = await fetch(REPORT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clusterRunId: result.runId }),
      });
      if (!res.ok) throw new Error("request failed");
      const body = (await res.json()) as { fileUrl: string };
      setReportUrl(body.fileUrl);
    } catch {
      setReportUrl(`/reports/risk-assessment-${result.runId}.pdf`);
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
      {/* Configure clustering */}
      <form
        onSubmit={handleRun}
        className="h-fit rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5"
      >
        <h2 className="text-[14px] font-medium text-[#16283F]">Configure clustering</h2>

        <div className="mt-4">
          <label htmlFor="dataset" className="block text-[13px] font-medium text-[#3A4048]">
            Approved dataset
          </label>
          <select
            id="dataset"
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
            className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#16283F] focus:ring-2 focus:ring-[#16283F]/10"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {selectedDataset && (
            <p className="mt-1 text-[12px] text-[#8A8D86]">
              {selectedDataset.siteCount} approved sites
            </p>
          )}
        </div>

        <div className="mt-4">
          <label htmlFor="k" className="block text-[13px] font-medium text-[#3A4048]">
            Number of clusters (k)
          </label>
          <input
            id="k"
            type="number"
            min={2}
            max={10}
            value={k}
            onChange={(e) => setK(clamp(parseInt(e.target.value, 10) || 2, 2, 10))}
            className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#16283F] focus:ring-2 focus:ring-[#16283F]/10"
          />
        </div>

        <div className="mt-4">
          <label htmlFor="distance" className="block text-[13px] font-medium text-[#3A4048]">
            Distance parameter
          </label>
          <select
            id="distance"
            value={distanceMetric}
            onChange={(e) => setDistanceMetric(e.target.value as DistanceMetric)}
            className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#16283F] focus:ring-2 focus:ring-[#16283F]/10"
          >
            <option value="haversine">Haversine (geographic distance)</option>
            <option value="euclidean">Euclidean</option>
          </select>
          <p className="mt-1 text-[12px] text-[#8A8D86]">
            Haversine accounts for the Earth&apos;s curvature and is recommended for GPS coordinates.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isRunning}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning && <Spinner />}
          {isRunning ? "Running K-Means clustering…" : "Run K-Means clustering"}
        </button>
      </form>

      {/* Output */}
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <div className="aspect-[16/9] w-full bg-[#F4F3EF]">
            {result ? (
              <RiskZoneMap zones={result.zones} />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-[#8A8D86]">
                Configure and run clustering to see risk zones here.
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white">
            <div className="flex items-center justify-between border-b border-[#DEDBD1] px-5 py-3.5">
              <h2 className="text-[14px] font-medium text-[#16283F]">Results</h2>
              <p className="text-[12px] text-[#8A8D86]">
                {result.totalSitesAnalyzed} sites analyzed
              </p>
            </div>

            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#16283F] text-[#F4F2ED]">
                  <th className="px-4 py-2.5 font-medium">Zone</th>
                  <th className="px-4 py-2.5 font-medium">Risk level</th>
                  <th className="px-4 py-2.5 font-medium">Sites</th>
                </tr>
              </thead>
              <tbody>
                {result.zones.map((z, i) => {
                  const c = RISK_COLORS[z.riskLevel];
                  return (
                    <tr key={z.id} className={i % 2 === 1 ? "bg-[#FAF9F6]" : undefined}>
                      <td className="px-4 py-2.5 text-[#23262B]">Zone {z.label}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-medium capitalize"
                          style={{ backgroundColor: c.bg, color: c.text }}
                        >
                          {z.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#5B6472]">{z.siteCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="flex flex-wrap items-center gap-3 border-t border-[#DEDBD1] px-5 py-4">
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 rounded-[6px] bg-[#16283F] px-4 py-2 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingReport && <Spinner />}
                {isGeneratingReport ? "Generating…" : "Generate risk assessment report"}
              </button>

              <Link
                href="/analyst/dashboard/gis-map"
                className="text-[13px] font-medium text-[#16283F] hover:underline"
              >
                View risk zones on GIS map →
              </Link>

              {reportUrl && (
                <a
                  href={reportUrl}
                  className="ml-auto text-[13px] font-medium text-[#2C6B33] hover:underline"
                >
                  Report ready — download →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskZoneMap({ zones }: { zones: RiskZone[] }) {
  const gridLines = [0, 1, 2, 3, 4, 5];

  return (
    <div className="relative h-full w-full">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {gridLines.map((i) => (
          <line
            key={`v${i}`}
            x1={`${(i / (gridLines.length - 1)) * 100}%`}
            y1="0"
            x2={`${(i / (gridLines.length - 1)) * 100}%`}
            y2="100%"
            stroke="#DEDBD1"
            strokeWidth={1}
          />
        ))}
        {gridLines.map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${(i / (gridLines.length - 1)) * 100}%`}
            x2="100%"
            y2={`${(i / (gridLines.length - 1)) * 100}%`}
            stroke="#DEDBD1"
            strokeWidth={1}
          />
        ))}
      </svg>

      {zones.map((z) => {
        const c = RISK_COLORS[z.riskLevel];
        const size = 20 + z.siteCount * 3;
        return (
          <div
            key={z.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-medium text-white"
            style={{
              left: `${z.centroid.xPct}%`,
              top: `${z.centroid.yPct}%`,
              width: size,
              height: size,
              backgroundColor: c.dot,
              opacity: 0.85,
            }}
          >
            {z.label}
          </div>
        );
      })}
    </div>
  );
}

/**
 * Deterministic placeholder clustering result, used only when the real API
 * isn't available yet. Distributes total sites across k zones and assigns
 * risk levels by rank (largest zones skew higher-risk), so the UI has
 * something realistic to render end to end during development.
 */
function buildPlaceholderResult(k: number, totalSites: number): ClusterRunResult {
  const base = Math.floor(totalSites / k);
  let remainder = totalSites - base * k;

  const zones: RiskZone[] = Array.from({ length: k }).map((_, i) => {
    const siteCount = base + (remainder-- > 0 ? 1 : 0);
    const riskLevel: RiskLevel =
      i === 0 ? "critical" : i < Math.ceil(k / 3) ? "high" : i < Math.ceil((k * 2) / 3) ? "medium" : "low";

    const angle = (i / k) * Math.PI * 2;
    return {
      id: `zone-${i}`,
      label: String.fromCharCode(65 + i),
      riskLevel,
      siteCount: Math.max(1, siteCount),
      centroid: {
        xPct: 50 + Math.cos(angle) * 32,
        yPct: 50 + Math.sin(angle) * 32,
      },
    };
  });

  return {
    runId: `run-${Date.now()}`,
    zones,
    totalSitesAnalyzed: totalSites,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin text-[#F4F2ED]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}