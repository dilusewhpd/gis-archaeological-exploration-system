import Link from "next/link";

/**
 * Field Officer dashboard — /dashboard
 *
 * Server component: fetches the officer's summary stats and recent
 * submissions on the server. Replace DASHBOARD_ENDPOINT with your real
 * API route; falls back to placeholder data if the request fails so the
 * page still renders during local development.
 */

const DASHBOARD_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/field-officer/dashboard-summary`;

type SubmissionStatus = "approved" | "pending" | "correction_requested";

type Submission = {
  id: string;
  siteName: string;
  date: string;
  status: SubmissionStatus;
};

type DashboardSummary = {
  sitesSubmitted: number;
  pendingReview: number;
  approved: number;
  recentSubmissions: Submission[];
};

const FALLBACK_DATA: DashboardSummary = {
  sitesSubmitted: 18,
  pendingReview: 3,
  approved: 14,
  recentSubmissions: [
    { id: "1", siteName: "Anuradhapura North", date: "2026-07-01", status: "approved" },
    { id: "2", siteName: "Sigiriya East ridge", date: "2026-07-05", status: "pending" },
    { id: "3", siteName: "Polonnaruwa canal site", date: "2026-07-09", status: "pending" },
  ],
};

async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const res = await fetch(DASHBOARD_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return FALLBACK_DATA;
    return (await res.json()) as DashboardSummary;
  } catch {
    return FALLBACK_DATA;
  }
}

export default async function FieldOfficerDashboardPage() {
  const { sitesSubmitted, pendingReview, approved, recentSubmissions } =
    await getDashboardSummary();

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">
          Field Officer dashboard
        </h1>
        <Link
          href="/dashboard/profile"
          aria-label="View profile"
          className="h-8 w-8 rounded-full border border-[#DEDBD1] bg-[#F4F3EF] transition hover:border-[#16283F]/30"
        />
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Sites submitted" value={sitesSubmitted} />
          <StatCard label="Pending review" value={pendingReview} />
          <StatCard label="Approved" value={approved} />
        </div>

        {/* Recent submissions */}
        <section className="mt-8">
          <h2 className="text-[15px] font-medium text-[#16283F]">Recent submissions</h2>

          <div className="mt-3 overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#16283F] text-[#F4F2ED]">
                  <th className="px-4 py-2.5 font-medium">Site name</th>
                  <th className="px-4 py-2.5 font-medium">Date</th>
                  <th className="px-4 py-2.5 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSubmissions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-6 text-center text-[#8A8D86]">
                      No submissions yet. Register your first site to get started.
                    </td>
                  </tr>
                ) : (
                  recentSubmissions.map((s, i) => (
                    <tr
                      key={s.id}
                      className={i % 2 === 1 ? "bg-[#FAF9F6]" : undefined}
                    >
                      <td className="px-4 py-2.5 text-[#23262B]">{s.siteName}</td>
                      <td className="px-4 py-2.5 text-[#5B6472]">
                        {formatDate(s.date)}
                      </td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={s.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Register new site */}
        <Link
          href="/dashboard/new-site"
          className="mt-6 inline-flex items-center gap-2 rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450]"
        >
          <PlusIcon />
          Register new site
        </Link>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4">
      <p className="text-[13px] text-[#5B6472]">{label}</p>
      <p className="mt-1.5 font-serif text-[28px] leading-none text-[#16283F]">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: SubmissionStatus }) {
  const config: Record<SubmissionStatus, { label: string; bg: string; text: string }> = {
    approved: { label: "Approved", bg: "#EAF3EA", text: "#2C6B33" },
    pending: { label: "Pending", bg: "#FBF0EB", text: "#9A5A2E" },
    correction_requested: { label: "Correction requested", bg: "#FBEBEA", text: "#B03A2E" },
  };
  const { label, bg, text } = config[status];

  return (
    <span
      className="inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}