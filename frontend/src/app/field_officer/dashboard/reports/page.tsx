"use client";

import Link from "next/link";
import { useState } from "react";

type ReportItem = {
  id: string;
  name: string;
  type: string;
  format: "PDF" | "CSV";
  dateGenerated: string;
  fileSize: string;
};

const INITIAL_HISTORY: ReportItem[] = [
  {
    id: "rep-1",
    name: "Exploration Summary - June 2026",
    type: "Exploration Log Summary",
    format: "PDF",
    dateGenerated: "2026-06-30 16:45",
    fileSize: "1.2 MB",
  },
  {
    id: "rep-2",
    name: "Approval Status Audit - Q2 2026",
    type: "Submission Status Audit",
    format: "CSV",
    dateGenerated: "2026-06-15 09:12",
    fileSize: "320 KB",
  },
  {
    id: "rep-3",
    name: "Weekly Log - Week 25",
    type: "Weekly Activity Summary",
    format: "PDF",
    dateGenerated: "2026-06-22 18:00",
    fileSize: "840 KB",
  },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState("Exploration Log Summary");
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [format, setFormat] = useState<"PDF" | "CSV">("PDF");
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<ReportItem[]>(INITIAL_HISTORY);

  function handleGenerate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsGenerating(true);

    setTimeout(() => {
      const now = new Date();
      const formattedDate = now.toISOString().replace("T", " ").substring(0, 16);
      const newReport: ReportItem = {
        id: `rep-${Date.now()}`,
        name: `${reportType.replace(" Summary", "")} - Generated ${now.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
        type: reportType,
        format: format,
        dateGenerated: formattedDate,
        fileSize: format === "PDF" ? "1.1 MB" : "150 KB",
      };

      setHistory((prev) => [newReport, ...prev]);
      setIsGenerating(false);
    }, 1500);
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Reports</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/logout"
            className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#BB892C]"
          >
            Log out
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] font-serif text-[12px] text-[#8F6A21]">
            JP
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-8 py-7">
        {/* Stats Grid */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Submissions" value={18} subtitle="Logged sites to date" />
          <StatCard title="Approved Sites" value={12} subtitle="Verified by admin" />
          <StatCard title="Pending Review" value={4} subtitle="In validation queue" />
          <StatCard title="Needs Correction" value={2} subtitle="Requires updates" />
        </section>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          {/* Left Column: Form Card */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
              Generate Report
            </h2>
            <p className="mt-0.5 text-[11.5px] text-[#8A8D86]">
              Configure parameters to export your records.
            </p>

            <form onSubmit={handleGenerate} className="mt-4 space-y-4">
              <div>
                <label htmlFor="reportType" className="block text-[12px] font-medium text-[#5B6472]">
                  Report Type
                </label>
                <select
                  id="reportType"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                >
                  <option value="Exploration Log Summary">Exploration Log Summary</option>
                  <option value="Weekly Activity Summary">Weekly Activity Summary</option>
                  <option value="Submission Status Audit">Submission Status Audit</option>
                </select>
              </div>

              <div>
                <label htmlFor="dateRange" className="block text-[12px] font-medium text-[#5B6472]">
                  Date Range
                </label>
                <select
                  id="dateRange"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                >
                  <option value="Last 7 Days">Last 7 Days</option>
                  <option value="Last 30 Days">Last 30 Days</option>
                  <option value="Last 90 Days">Last 90 Days</option>
                  <option value="All Time">All Time</option>
                </select>
              </div>

              <div>
                <span className="block text-[12px] font-medium text-[#5B6472]">Format</span>
                <div className="mt-1.5 flex gap-4">
                  <label className="flex items-center gap-2 text-[13px] text-[#23262B] cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={format === "PDF"}
                      onChange={() => setFormat("PDF")}
                      className="h-4 w-4 border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
                    />
                    PDF Document
                  </label>
                  <label className="flex items-center gap-2 text-[13px] text-[#23262B] cursor-pointer">
                    <input
                      type="radio"
                      name="format"
                      checked={format === "CSV"}
                      onChange={() => setFormat("CSV")}
                      className="h-4 w-4 border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
                    />
                    CSV Spreadsheet
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full flex items-center justify-center gap-2 rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating && <Spinner />}
                {isGenerating ? "Exporting…" : "Generate Report"}
              </button>
            </form>
          </div>

          {/* Right Column: History Card */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
              Download History
            </h2>
            <p className="mt-0.5 text-[11.5px] text-[#8A8D86]">
              Access previously generated reports.
            </p>

            <div className="mt-4 overflow-hidden rounded-[8px] border border-[#DEDBD1]">
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#3A2A12] text-[#F4F2ED]">
                    <th className="px-4 py-2.5 font-medium">Report Name</th>
                    <th className="px-4 py-2.5 font-medium">Format</th>
                    <th className="px-4 py-2.5 font-medium">Date Generated</th>
                    <th className="px-4 py-2.5 font-medium">Size</th>
                    <th className="px-4 py-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#DEDBD1]/60">
                  {history.map((r, i) => (
                    <tr
                      key={r.id}
                      className={"transition-colors duration-200 hover:bg-[#FAF6EB]/60 cursor-pointer " + (i % 2 === 1 ? "bg-[#FAF6EB]/30" : "")}
                    >
                      <td className="px-4 py-3 font-medium text-[#3A2A12]">{r.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                            r.format === "PDF" ? "bg-[#FBEBEA] text-[#B03A2E]" : "bg-[#EAF3EA] text-[#2C6B33]"
                          }`}
                        >
                          {r.format}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#5B6472]">{r.dateGenerated}</td>
                      <td className="px-4 py-3 text-[#8A8D86]">{r.fileSize}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Downloading ${r.name} (${r.format})...`)}
                          className="text-[13px] font-medium text-[#BB892C] hover:underline"
                        >
                          Download
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ title, value, subtitle }: { title: string; value: number; subtitle: string }) {
  return (
    <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4 flex flex-col justify-between shadow-xs hover:-translate-y-0.5 hover:border-[#BB892C]/20 hover:shadow-sm transition-all duration-300">
      <span className="text-[12px] font-medium text-[#8A8478]">{title}</span>
      <span className="mt-2 font-serif text-[28px] font-bold text-[#3A2A12] leading-none">{value}</span>
      <span className="mt-2 text-[11px] text-[#8A8D86]">{subtitle}</span>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-[#F4F2ED]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
