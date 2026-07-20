"use client";

import { useState, useMemo } from "react";
import LinkNext from "next/link";

type ReportType = "analytical" | "risk_assessment";
type ReportStatus = "ready" | "generating" | "failed";

type ReportRecord = {
  id: string;
  title: string;
  type: ReportType;
  region: string;
  generatedAt: string;
  status: ReportStatus;
};

const INITIAL_REPORTS: ReportRecord[] = [
  {
    id: "rep1",
    title: "Central Province — Site Prioritization & Recommendations",
    type: "analytical",
    region: "Central Province",
    generatedAt: "2026-07-10",
    status: "ready",
  },
  {
    id: "rep2",
    title: "Southern Province — Risk Assessment",
    type: "risk_assessment",
    region: "Southern Province",
    generatedAt: "2026-07-08",
    status: "ready",
  },
  {
    id: "rep3",
    title: "Northern Province — Risk Assessment",
    type: "risk_assessment",
    region: "Northern Province",
    generatedAt: "2026-07-05",
    status: "ready",
  },
  {
    id: "rep4",
    title: "Western Province — Site Prioritization & Recommendations",
    type: "analytical",
    region: "Western Province",
    generatedAt: "2026-07-01",
    status: "failed",
  },
];

export default function AnalystReportsPage() {
  const [reports, setReports] = useState<ReportRecord[]>(INITIAL_REPORTS);
  const [generatingType, setGeneratingType] = useState<ReportType | null>(null);

  const prioritizedResultsAvailable = true;
  const latestPrioritizationRegion = "Central Province";
  const riskAnalysisAvailable = true;
  const latestRiskRunRegion = "Southern Province";

  function handleGenerate(type: ReportType) {
    setGeneratingType(type);
    const pendingId = `rep-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const region = type === "analytical" ? latestPrioritizationRegion : latestRiskRunRegion;
    const title = type === "analytical" 
      ? `${region} — Site Prioritization & Recommendations` 
      : `${region} — Risk Assessment`;

    setReports((prev) => [
      { id: pendingId, title, type, region, generatedAt: today, status: "generating" },
      ...prev,
    ]);

    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) => (r.id === pendingId ? { ...r, status: "ready" } : r))
      );
      setGeneratingType(null);
    }, 1500);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div>
          <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Reports</h1>
          <p className="mt-0.5 text-[12px] text-[#8A8478]">
            Compile spatial threat reports and prioritize conservation action checklists.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LinkNext
            href="/auth/logout"
            className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#BB892C]"
          >
            Log out
          </LinkNext>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] font-serif text-[12px] text-[#8F6A21]">
            KS
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/10">
        {/* Generate report cards */}
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {/* Card 1: Analytical/Prioritization Report */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-[16px] text-[#3A2A12]">Analytical/Prioritization Report</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6472]">
                Summarizes prioritized archaeological sites, active hazard metrics, and conservation recommendations from the decision support system.
              </p>
            </div>
            <div>
              <p className="mt-3 text-[12px] text-[#8A8D86]">
                Latest priority data: {latestPrioritizationRegion}
              </p>
              <button
                type="button"
                onClick={() => handleGenerate("analytical")}
                disabled={generatingType !== null}
                className="mt-4 flex w-full items-center justify-center rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
              >
                {generatingType === "analytical" ? "Generating…" : "Generate analytical report"}
              </button>
            </div>
          </div>

          {/* Card 2: Risk Assessment Report */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 flex flex-col justify-between">
            <div>
              <h2 className="font-serif text-[16px] text-[#3A2A12]">Risk Assessment Report</h2>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6472]">
                Summarizes density calculations, algorithm run outcomes (K-Means/DBSCAN), and color-coded risk zone boundaries.
              </p>
            </div>
            <div>
              <p className="mt-3 text-[12px] text-[#8A8D86]">
                Latest model output: {latestRiskRunRegion}
              </p>
              <button
                type="button"
                onClick={() => handleGenerate("risk_assessment")}
                disabled={generatingType !== null}
                className="mt-4 flex w-full items-center justify-center rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
              >
                {generatingType === "risk_assessment" ? "Generating…" : "Generate risk assessment report"}
              </button>
            </div>
          </div>
        </div>

        {/* Report history */}
        <div className="mt-6 rounded-[8px] border border-[#DEDBD1] bg-white overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#DEDBD1] px-5 py-4">
            <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">Report History</h2>
            <p className="text-[12px] font-medium text-[#BB892C] bg-[#FAF6EB] px-2 py-0.5 rounded border border-[#DEDBD1]/60">
              {reports.length} reports compiled
            </p>
          </div>

          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#3A2A12] text-[12px] text-[#F4F2ED]">
                <th className="px-5 py-2.5 font-medium">Report</th>
                <th className="px-5 py-2.5 font-medium">Type</th>
                <th className="px-5 py-2.5 font-medium">Region</th>
                <th className="px-5 py-2.5 font-medium">Generated</th>
                <th className="px-5 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDBD1]/60">
              {reports.map((report) => (
                <tr key={report.id} className="transition-colors hover:bg-[#FAF6EB]/40">
                  <td className="px-5 py-3 text-[#3A2A12] font-semibold">{report.title}</td>
                  <td className="px-5 py-3 text-[#3A4048]">
                    {report.type === "analytical" ? "Analytical/Prioritization" : "Risk Assessment"}
                  </td>
                  <td className="px-5 py-3 text-[#3A4048]">{report.region}</td>
                  <td className="px-5 py-3 text-[#3A4048]">{report.generatedAt}</td>
                  <td className="px-5 py-3">
                    <StatusBadge status={report.status} />
                  </td>
                  <td className="px-5 py-3 text-right">
                    {report.status === "ready" ? (
                      <button
                        type="button"
                        onClick={() => alert(`Downloading ${report.title}...`)}
                        className="text-[13px] font-medium text-[#BB892C] hover:underline"
                      >
                        Download
                      </button>
                    ) : report.status === "generating" ? (
                      <span className="text-[13px] text-[#8A8D86]">Processing…</span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleGenerate(report.type)}
                        className="text-[13px] font-medium text-[#B03A2E] hover:underline"
                      >
                        Retry
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    ready: "bg-[#EAF1EA] text-[#2F5C3B]",
    generating: "bg-[#FAF6EB] text-[#8A8478]",
    failed: "bg-[#F6E8E3] text-[#9A4B2E]",
  };

  const labels: Record<ReportStatus, string> = {
    ready: "Ready",
    generating: "Generating",
    failed: "Failed",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}