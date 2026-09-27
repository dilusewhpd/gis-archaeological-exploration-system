"use client";

import { useEffect, useState } from "react";
import LogoutButton from "@/components/LogoutButton";
import { useAuth } from "@/hooks/useAuth";
import { apiErrorMessage, getSiteDashboard, type SiteDashboardStats } from "@/lib/sites";
import { downloadMySitesReport } from "@/lib/reports";

type GenerateState = "idle" | "generating" | "success" | "error";

export default function ReportsPage() {
  const { user } = useAuth();

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
      const { filename } = await downloadMySitesReport();
      setResult({ filename, at: new Date().toLocaleString("en-GB") });
      setState("success");
    } catch (err) {
      setError(apiErrorMessage(err));
      setState("error");
    }
  }

  const officerName = user ? `${user.firstName} ${user.lastName}`.trim() : "Field Officer";
  const officerInitials =
    officerName
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "FO";

  return (
    <div className="flex flex-1 flex-col">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Reports</h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            Generate an official exploration log of your site submissions
          </p>
        </div>
        <div className="flex items-center gap-4">
          <LogoutButton className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#BB892C]" />
          <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#DEDBD1] bg-[#F0E6C8] text-[12px] font-medium text-[#8F6A21]">
            {officerInitials}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-7 lg:px-9">
        {/* Stats Grid */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            title="Total submissions"
            value={statsLoading ? "—" : (stats?.total ?? 0)}
            subtitle="Logged sites to date"
          />
          <StatCard
            title="Approved"
            value={statsLoading ? "—" : (stats?.approved ?? 0)}
            subtitle="Verified sites"
            valueClassName="text-[#2C6B33]"
          />
          <StatCard
            title="Pending review"
            value={statsLoading ? "—" : (stats?.pending ?? 0)}
            subtitle="In validation queue"
            valueClassName="text-[#9A5A2E]"
          />
          <StatCard
            title="Rejected"
            value={statsLoading ? "—" : (stats?.rejected ?? 0)}
            subtitle="Needs resurvey"
            valueClassName="text-[#B03A2E]"
          />
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[380px_minmax(0,1fr)]">
          {/* Generate card */}
          <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
              Exploration Log
            </h2>
            <p className="mt-1 text-[13px] leading-relaxed text-[#5B6472]">
              A PDF covering every site you&apos;ve registered — status, location,
              historical details, and approval or rejection notes.
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

          {/* About this report */}
          <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
            <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
              About this report
            </h2>
            <ul className="mt-3 space-y-3">
              <AboutRow
                title="Your sites, in full"
                detail="Every site you've registered, in any status — draft, pending, approved, or rejected."
              />
              <AboutRow
                title="Status & location"
                detail="Current review status alongside district, province, historical period, and site type."
              />
              <AboutRow
                title="Approval trail"
                detail="Submission date, and the approval or rejection date — with the reviewer's rejection reason when applicable."
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
  title,
  value,
  subtitle,
  valueClassName = "text-[#3A2A12]",
}: {
  title: string;
  value: number | string;
  subtitle: string;
  valueClassName?: string;
}) {
  return (
    <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4 flex flex-col justify-between shadow-xs hover:-translate-y-0.5 hover:border-[#BB892C]/20 hover:shadow-sm transition-all duration-300">
      <span className="text-[12px] font-medium text-[#8A8478]">{title}</span>
      <span className={`mt-2 font-serif text-[26px] font-bold leading-none ${valueClassName}`}>{value}</span>
      <span className="mt-2 text-[11px] text-[#8A8D86]">{subtitle}</span>
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
