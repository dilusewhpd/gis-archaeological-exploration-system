"use client";

import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { apiErrorMessage } from "@/lib/sites";
import { downloadMySitesReport } from "@/lib/reports";

export default function ReportsPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDownloadedAt, setLastDownloadedAt] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    try {
      await downloadMySitesReport();
      setLastDownloadedAt(new Date().toLocaleString("en-GB"));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Reports</h1>
        <div className="flex items-center gap-4">
          <LogoutButton className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#BB892C]" />
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

        <div className="mt-6 max-w-[420px] rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
          <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
            Exploration Log
          </h2>
          <p className="mt-0.5 text-[11.5px] text-[#8A8D86]">
            Generates a PDF covering every site you&apos;ve registered — status,
            location, historical details, and approval/rejection notes.
          </p>

          {error && (
            <div
              role="alert"
              className="mt-4 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
            >
              {error}
            </div>
          )}

          {lastDownloadedAt && !error && (
            <p className="mt-4 text-[12px] text-[#2C6B33]">
              Downloaded at {lastDownloadedAt}.
            </p>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating}
            className="mt-4 w-full flex items-center justify-center gap-2 rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating && <Spinner />}
            {isGenerating ? "Generating…" : "Generate Report"}
          </button>
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
