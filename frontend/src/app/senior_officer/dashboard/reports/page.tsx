"use client";

import { useState } from "react";

/**
 * Senior officer reports — /senior_officer/dashboard/reports
 *
 * FRONTEND-ONLY, same pattern as the admin reports page: no API calls
 * yet, "Generate report" just appends a row to local state after a
 * short simulated delay. Once a real report-generation endpoint exists,
 * replace handleGenerate's setTimeout with a real POST call, and load
 * INITIAL_REPORTS from a server fetch instead.
 */

type ReportStatus = "Ready" | "Generating";

type ReviewReport = {
  id: string;
  title: string;
  generatedAt: string;
  status: ReportStatus;
};

const INITIAL_REPORTS: ReviewReport[] = [
  { id: "rep1", title: "Site Review & Approval Summary — July 2026", generatedAt: "2026-07-10", status: "Ready" },
  { id: "rep2", title: "Site Review & Approval Summary — June 2026", generatedAt: "2026-06-10", status: "Ready" },
  { id: "rep3", title: "Site Review & Approval Summary — May 2026", generatedAt: "2026-05-10", status: "Ready" },
];

export default function SeniorOfficerReportsPage() {
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [isGenerating, setIsGenerating] = useState(false);

  function handleGenerate() {
    setIsGenerating(true);

    const pendingId = `rep${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);

    setReports((prev) => [
      {
        id: pendingId,
        title: `Site Review & Approval Summary — ${formatMonth(today)}`,
        generatedAt: today,
        status: "Generating",
      },
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
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Reports</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Generate report */}
        <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
          <h2 className="font-serif text-[16px] text-[#3A2A12] uppercase tracking-wider font-semibold text-[13px]">
            Generate Site Review &amp; Approval Summary
          </h2>
          <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-[#5B6472]">
            Generates a summary of sites approved and rejected under review, including rejection
            reasons and turnaround times, for departmental record-keeping.
          </p>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-4 rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
          >
            {isGenerating ? "Generating…" : "Generate report"}
          </button>
        </div>

        {/* Report history */}
        <div className="mt-6 overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <div className="flex items-center justify-between border-b border-[#DEDBD1] px-5 py-4">
            <h2 className="text-[14px] font-medium text-[#3A2A12]">Report history</h2>
            <p className="text-[13px] text-[#8A8D86]">{reports.length} reports</p>
          </div>

          {reports.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">
              No reports generated yet.
            </p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#3A2A12] text-[12px] text-[#F4F2ED]">
                  <th className="px-5 py-3 font-medium">Report</th>
                  <th className="px-5 py-3 font-medium">Generated</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, i) => (
                  <tr key={report.id} className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}>
                    <td className="px-5 py-3 text-[#3A2A12]">{report.title}</td>
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
                        <button
                          type="button"
                          onClick={() => alert(`Downloading ${report.title}...`)}
                          className="font-medium text-[#BB892C] underline-offset-2 hover:underline"
                        >
                          Download
                        </button>
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
