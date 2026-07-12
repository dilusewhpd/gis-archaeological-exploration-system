"use client";

import Link from "next/link";
import { useState } from "react";

/**
 * Admin reports — /admin/dashboard/reports
 *
 * FRONTEND-ONLY: no API calls yet. "Generate report" just appends a row
 * to local state after a short simulated delay. Once the backend
 * exists, replace handleGenerate's setTimeout with a real POST to your
 * report-generation endpoint, and load REPORT_HISTORY from a server
 * fetch instead of the hardcoded array below (same pattern as the other
 * dashboard pages).
 *
 * Use-case mapping (Decision Support module):
 *  - "Generate management report" --<<extends>>--> "View decision
 *     support dashboard" — the admin only has this one report type,
 *     unlike the analyst's separate analytical / risk-assessment
 *     reports, so this page stays to a single generate action.
 */

type ReportStatus = "Ready" | "Generating";

type ManagementReport = {
  id: string;
  title: string;
  generatedAt: string;
  status: ReportStatus;
};

const INITIAL_REPORTS: ManagementReport[] = [
  { id: "rep1", title: "Management report — July 2026", generatedAt: "2026-07-10", status: "Ready" },
  { id: "rep2", title: "Management report — June 2026", generatedAt: "2026-06-10", status: "Ready" },
  { id: "rep3", title: "Management report — May 2026", generatedAt: "2026-05-10", status: "Ready" },
];

export default function AdminReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [isGenerating, setIsGenerating] = useState(false);

  function handleGenerate() {
    setIsGenerating(true);

    const pendingId = `rep${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);

    setReports((prev) => [
      { id: pendingId, title: `Management report — ${formatMonth(today)}`, generatedAt: today, status: "Generating" },
      ...prev,
    ]);

    // Simulated generation delay — swap for a real API call later.
    setTimeout(() => {
      setReports((prev) =>
        prev.map((r) => (r.id === pendingId ? { ...r, status: "Ready" } : r))
      );
      setIsGenerating(false);
    }, 1200);
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">Reports</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Generate report */}
        <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
          <h2 className="font-serif text-[16px] text-[#16283F]">Management report</h2>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-[#5B6472]">
            Summarizes site prioritization, conservation recommendations, and monitoring status
            from the decision support dashboard.
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-4 rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
          >
            {isGenerating ? "Generating…" : "Generate report"}
          </button>
        </div>

        {/* Report history */}
        <div className="mt-6 overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <div className="flex items-center justify-between border-b border-[#DEDBD1] px-5 py-4">
            <h2 className="text-[14px] font-medium text-[#16283F]">Report history</h2>
            <p className="text-[13px] text-[#8A8D86]">{reports.length} reports</p>
          </div>

          {reports.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">
              No reports generated yet.
            </p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#16283F] text-[12px] text-[#F4F2ED]">
                  <th className="px-5 py-3 font-medium">Report</th>
                  <th className="px-5 py-3 font-medium">Generated</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, i) => (
                  <tr key={report.id} className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}>
                    <td className="px-5 py-3 text-[#16283F]">{report.title}</td>
                    <td className="px-5 py-3 text-[#3A4048]">{report.generatedAt}</td>
                    <td className="px-5 py-3">
                      <span
                        className={
                          report.status === "Ready" ? "text-[#2F5C3B]" : "text-[#5B6472]"
                        }
                      >
                        {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      {report.status === "Ready" ? (
                        <Link
                          href={`/admin/dashboard/reports/${report.id}`}
                          className="font-medium text-[#16283F] underline-offset-2 hover:underline"
                        >
                          View
                        </Link>
                      ) : (
                        <span className="text-[#8A8D86]">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function formatMonth(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}