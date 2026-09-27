"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage } from "@/lib/sites";
import { downloadRiskAssessmentReport } from "@/lib/reports";

type GenerateState = "idle" | "generating" | "success" | "error";

export default function AnalystReportsPage() {
  const { user } = useAuth();

  const [state, setState] = useState<GenerateState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ filename: string; at: string } | null>(null);

  async function handleGenerate() {
    setState("generating");
    setError(null);
    try {
      const { filename } = await downloadRiskAssessmentReport();
      setResult({ filename, at: new Date().toLocaleString("en-GB") });
      setState("success");
    } catch (err) {
      setError(apiErrorMessage(err));
      setState("error");
    }
  }

  const analystName = user ? `${user.firstName} ${user.lastName}`.trim() : "Analyst";
  const analystInitials =
    analystName
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AN";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-y-2 border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div className="min-w-0">
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">Reports</h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            Compile a system-wide risk assessment of approved sites
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-4">
          <Link
            href="/analyst/dashboard/notifications"
            aria-label="Notifications"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#DEDBD1] bg-white text-[#8A8478] transition hover:border-[#BB892C]/40 hover:text-[#BB892C]"
          >
            <BellIcon />
          </Link>
          <Link
            href="/analyst/dashboard/profile"
            aria-label="View profile"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] text-[12px] font-semibold text-[#8F6A21] transition hover:border-[#BB892C]/40"
          >
            {analystInitials}
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-[#F0E6C8]/30 px-6 py-7 lg:px-9">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="font-serif text-[16px] text-[#3A2A12]">Risk Assessment Report</h2>
            <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6472]">
              A PDF scoring every approved site with the Random Forest risk
              model — climate zone, elevation, distance to coast, and the
              resulting risk level, with high-risk sites flagged first.
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
              {state === "generating" ? "Assessing sites…" : "Generate Report"}
            </button>
            {state === "generating" && (
              <p className="mt-2 text-[11.5px] text-[#8A8D86]">
                Scoring each approved site live — this can take a few seconds.
              </p>
            )}
          </div>

          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
              About this report
            </h2>
            <ul className="mt-3 space-y-3">
              <AboutRow
                title="Approved sites only"
                detail="Risk assessment is only meaningful once a site's location is verified — draft, pending, and rejected sites aren't included."
              />
              <AboutRow
                title="High-risk sites first"
                detail="Sites are grouped by risk level, with High risk listed before Medium and Low, so the sites needing attention surface immediately."
              />
              <AboutRow
                title="Model inputs shown"
                detail="Climate zone, elevation, and distance to coast are listed alongside each score, plus the full Low/Medium/High probability breakdown."
              />
              <AboutRow
                title="Computed live"
                detail="Each site is scored by the Random Forest model at generation time — never a cached or stale result."
              />
            </ul>
          </div>
        </div>
      </main>
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

function BellIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}
