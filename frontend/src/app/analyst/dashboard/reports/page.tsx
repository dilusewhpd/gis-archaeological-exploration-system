import Link from "next/link";

/**
 * Analyst reports — /analyst/dashboard/reports
 *
 * Server component: fetches report generation state (prioritized sites
 * ready for an analytical report, risk analysis runs ready for a risk
 * assessment report) plus report history. Replace REPORTS_ENDPOINT with
 * your real API route; falls back to placeholder data if the request
 * fails.
 *
 * Use-case mapping:
 *  - "View the prioritized results" --<<extends>>--> "Generate analytical report"
 *      (Decision Support module)
 *  - "View risk analysis result" --<<extends>>--> "Generate risk assessment report"
 *      (Risk Assessment module)
 *
 * Report generation itself (the actual PDF/export build) should be wired
 * to a real backend job — the "Generate" actions here POST to stub routes
 * and the row is expected to move into recentReports once the job
 * finishes.
 */

const REPORTS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/analyst/reports`;

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

type ReportsData = {
  prioritizedResultsAvailable: boolean;
  latestPrioritizationRegion: string | null;
  riskAnalysisAvailable: boolean;
  latestRiskRunRegion: string | null;
  recentReports: ReportRecord[];
};

const FALLBACK_DATA: ReportsData = {
  prioritizedResultsAvailable: true,
  latestPrioritizationRegion: "Central Province",
  riskAnalysisAvailable: true,
  latestRiskRunRegion: "Southern Province",
  recentReports: [
    {
      id: "rep1",
      title: "Central Province — Site Prioritization",
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
      title: "Western Province — Site Prioritization",
      type: "analytical",
      region: "Western Province",
      generatedAt: "2026-07-01",
      status: "failed",
    },
  ],
};

async function getReportsData(): Promise<ReportsData> {
  try {
    const res = await fetch(REPORTS_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return FALLBACK_DATA;
    return (await res.json()) as ReportsData;
  } catch {
    return FALLBACK_DATA;
  }
}

export default async function AnalystReportsPage() {
  const {
    prioritizedResultsAvailable,
    latestPrioritizationRegion,
    riskAnalysisAvailable,
    latestRiskRunRegion,
    recentReports,
  } = await getReportsData();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">Reports</h1>
        <Link
          href="/analyst/dashboard/profile"
          aria-label="View profile"
          className="h-8 w-8 rounded-full border border-[#DEDBD1] bg-[#F4F3EF] transition hover:border-[#16283F]/30"
        />
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Generate report cards */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <GenerateReportCard
            title="Analytical report"
            description="Summarizes prioritized archaeological sites and conservation recommendations from the decision-support dashboard."
            sourceLabel={
              prioritizedResultsAvailable
                ? `Latest prioritization: ${latestPrioritizationRegion}`
                : "No prioritized results yet"
            }
            action="/analyst/dashboard/reports/generate?type=analytical"
            disabled={!prioritizedResultsAvailable}
            prerequisiteHref="/analyst/dashboard/risk-assessment"
            prerequisiteLabel="View prioritized results"
          />

          <GenerateReportCard
            title="Risk assessment report"
            description="Summarizes clustering results, site density, and high-risk zones from a completed risk analysis run."
            sourceLabel={
              riskAnalysisAvailable
                ? `Latest risk analysis: ${latestRiskRunRegion}`
                : "No risk analysis results yet"
            }
            action="/analyst/dashboard/reports/generate?type=risk_assessment"
            disabled={!riskAnalysisAvailable}
            prerequisiteHref="/analyst/dashboard/risk-assessment"
            prerequisiteLabel="View risk analysis result"
          />
        </div>

        {/* Report history */}
        <div className="mt-6 rounded-[8px] border border-[#DEDBD1] bg-white">
          <div className="flex items-center justify-between border-b border-[#DEDBD1] px-5 py-4">
            <h2 className="text-[14px] font-medium text-[#16283F]">Report history</h2>
            <p className="text-[13px] text-[#8A8D86]">{recentReports.length} reports</p>
          </div>

          {recentReports.length === 0 ? (
            <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">
              No reports generated yet. Generate an analytical or risk assessment report above to
              see it here.
            </p>
          ) : (
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="text-[12px] text-[#8A8D86]">
                  <th className="px-5 py-2.5 font-normal">Report</th>
                  <th className="px-5 py-2.5 font-normal">Type</th>
                  <th className="px-5 py-2.5 font-normal">Region</th>
                  <th className="px-5 py-2.5 font-normal">Generated</th>
                  <th className="px-5 py-2.5 font-normal">Status</th>
                  <th className="px-5 py-2.5 font-normal text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentReports.map((report) => (
                  <ReportRow key={report.id} report={report} />
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}

function GenerateReportCard({
  title,
  description,
  sourceLabel,
  action,
  disabled,
  prerequisiteHref,
  prerequisiteLabel,
}: {
  title: string;
  description: string;
  sourceLabel: string;
  action: string;
  disabled: boolean;
  prerequisiteHref: string;
  prerequisiteLabel: string;
}) {
  return (
    <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
      <h2 className="font-serif text-[16px] text-[#16283F]">{title}</h2>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6472]">{description}</p>
      <p className="mt-3 text-[12px] text-[#8A8D86]">{sourceLabel}</p>

      {disabled ? (
        <Link
          href={prerequisiteHref}
          className="mt-4 flex w-full items-center justify-center rounded-[6px] border border-[#DEDBD1] px-4 py-2.5 text-[13px] font-medium text-[#16283F] transition hover:border-[#16283F]/30"
        >
          {prerequisiteLabel}
        </Link>
      ) : (
        <Link
          href={action}
          className="mt-4 flex w-full items-center justify-center rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450]"
        >
          Generate report
        </Link>
      )}
    </div>
  );
}

function ReportRow({ report }: { report: ReportRecord }) {
  const typeLabel = report.type === "analytical" ? "Analytical" : "Risk assessment";

  return (
    <tr className="border-t border-[#DEDBD1]">
      <td className="px-5 py-3 text-[#16283F]">{report.title}</td>
      <td className="px-5 py-3 text-[#3A4048]">{typeLabel}</td>
      <td className="px-5 py-3 text-[#3A4048]">{report.region}</td>
      <td className="px-5 py-3 text-[#3A4048]">{report.generatedAt}</td>
      <td className="px-5 py-3">
        <StatusBadge status={report.status} />
      </td>
      <td className="px-5 py-3 text-right">
        {report.status === "ready" ? (
          <Link
            href={`/analyst/dashboard/reports/${report.id}`}
            className="text-[13px] font-medium text-[#16283F] underline-offset-2 hover:underline"
          >
            View
          </Link>
        ) : report.status === "generating" ? (
          <span className="text-[13px] text-[#8A8D86]">Processing…</span>
        ) : (
          <Link
            href={`/analyst/dashboard/reports/generate?type=${report.type}&retry=${report.id}`}
            className="text-[13px] font-medium text-[#9A4B2E] underline-offset-2 hover:underline"
          >
            Retry
          </Link>
        )}
      </td>
    </tr>
  );
}

function StatusBadge({ status }: { status: ReportStatus }) {
  const styles: Record<ReportStatus, string> = {
    ready: "bg-[#EAF1EA] text-[#2F5C3B]",
    generating: "bg-[#F4F3EF] text-[#5B6472]",
    failed: "bg-[#F6E8E3] text-[#9A4B2E]",
  };

  const labels: Record<ReportStatus, string> = {
    ready: "Ready",
    generating: "Generating",
    failed: "Failed",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}