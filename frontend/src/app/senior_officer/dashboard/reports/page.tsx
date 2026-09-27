"use client";

import { useEffect, useState } from "react";
import { apiErrorMessage, getSiteDashboard, type SiteDashboardStats } from "@/lib/sites";
import { downloadMyReviewsReport } from "@/lib/reports";

type GenerateState = "idle" | "generating" | "success" | "error";

export default function SeniorOfficerReportsPage() {
  const [stats, setStats] = useState<SiteDashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const [state, setState] = useState<GenerateState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ filename: string; at: string } | null>(null);

  useEffect(() => {
    let isMounted = true;
    getSiteDashboard()
      .then((data) => {
        if (isMounted) setStats(data);
      })
      .catch(() => {
        // Stat cards are a supplementary summary — leave them blank rather
        // than blocking the report-generation action on this page.
      })
      .finally(() => {
        if (isMounted) setStatsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleGenerate() {
    setState("generating");
    setError(null);
    try {
      const { filename } = await downloadMyReviewsReport();
      setResult({ filename, at: new Date().toLocaleString("en-GB") });
      setState("success");
    } catch (err) {
      setError(apiErrorMessage(err));
      setState("error");
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Reports</h1>
        <p className="mt-0.5 text-[12.5px] text-[#8A8478]">
          Generate an official record of the sites you&apos;ve reviewed
        </p>
      </header>

      <main className="flex-1 bg-[#F0E6C8]/30 px-8 py-7">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="Awaiting review"
            value={statsLoading ? "—" : (stats?.pending ?? 0)}
            tone="#9A5A2E"
            bg="#FBF0EB"
          />
          <StatCard
            label="Approved sites"
            value={statsLoading ? "—" : (stats?.approved ?? 0)}
            tone="#2C6B33"
            bg="#EAF3EA"
          />
          <StatCard
            label="Rejected sites"
            value={statsLoading ? "—" : (stats?.rejected ?? 0)}
            tone="#B03A2E"
            bg="#FBEBEA"
          />
        </div>

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="font-serif text-[16px] text-[#3A2A12]">Review Log</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6472]">
              A PDF covering sites awaiting review, plus every site you&apos;ve
              personally approved or rejected — status, submitter, review
              dates, and rejection reasons.
            </p>

            {state === "error" && error && (
              <div
                role="alert"
                className="mt-4 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
              >
                {error}
              </div>
            )}

            {state === "success" && result && (
              <div className="mt-4 rounded-[6px] border border-[#CFE0CB] bg-[#F3F8F1] px-3.5 py-2.5">
                <p className="flex items-center gap-1.5 text-[13px] font-medium text-[#2C6B33]">
                  <CheckIcon />
                  Report downloaded
                </p>
                <p className="mt-1 text-[12px] text-[#3A4048]">
                  <span className="font-mono">{result.filename}</span> · {result.at}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleGenerate}
              disabled={state === "generating"}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {state === "generating" && <Spinner />}
              {state === "generating" ? "Generating…" : "Generate Report"}
            </button>
          </div>

          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
              About this report
            </h2>
            <ul className="mt-3 space-y-3">
              <AboutRow
                title="The current queue"
                detail="Every site still awaiting review, system-wide — not just ones you've already acted on."
              />
              <AboutRow
                title="Your review history"
                detail="Every site you've personally approved or rejected, with the date and, for rejections, your reason."
              />
              <AboutRow
                title="Submitter attribution"
                detail="Each entry names the field officer who submitted it, for traceability."
              />
              <AboutRow
                title="Always current"
                detail="Generated fresh from live records each time you click Generate — never a cached or stale copy."
              />
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label, value, tone, bg,
}: {
  label: string; value: number | string; tone: string; bg: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wider text-[#8A8478]">{label}</p>
        <h3 className="mt-1 font-serif text-[26px] font-bold" style={{ color: tone }}>{value}</h3>
      </div>
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold"
        style={{ backgroundColor: bg, color: tone }}
      >
        {value}
      </span>
    </div>
  );
}

function AboutRow({ title, detail }: { title: string; detail: string }) {
  return (
    <li className="flex gap-2.5">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-[#BB892C]" />
      <div>
        <p className="text-[13px] font-medium text-[#23262B]">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-[#8A8478]">{detail}</p>
      </div>
    </li>
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

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
