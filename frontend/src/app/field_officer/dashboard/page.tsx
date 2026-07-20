import Link from "next/link";

/**
 * Field Officer dashboard — /field_officer/dashboard
 * Department of Archaeology, Sri Lanka
 *
 * Server component: fetches the officer's summary stats and recent
 * submissions on the server. Replace DASHBOARD_ENDPOINT with your real
 * API route; falls back to placeholder data if the request fails so the
 * page still renders during local development.
 *
 * NOTE: the sidebar lives in layout.tsx now — this file renders only
 * the top bar + main content.
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
  correctionRequested: number;
  weeklyActivity: { label: string; count: number }[];
  recentSubmissions: Submission[];
  officer?: {
    name: string;
    photoUrl?: string;
  };
};

const FALLBACK_DATA: DashboardSummary = {
  sitesSubmitted: 18,
  pendingReview: 3,
  approved: 14,
  correctionRequested: 1,
  weeklyActivity: [
    { label: "Mon", count: 1 },
    { label: "Tue", count: 3 },
    { label: "Wed", count: 2 },
    { label: "Thu", count: 4 },
    { label: "Fri", count: 2 },
    { label: "Sat", count: 5 },
    { label: "Sun", count: 1 },
  ],
  recentSubmissions: [
    { id: "1", siteName: "Anuradhapura North", date: "2026-07-01", status: "approved" },
    { id: "2", siteName: "Sigiriya East ridge", date: "2026-07-05", status: "pending" },
    { id: "3", siteName: "Polonnaruwa canal site", date: "2026-07-09", status: "pending" },
    { id: "4", siteName: "Yapahuwa terrace wall", date: "2026-07-11", status: "correction_requested" },
    { id: "5", siteName: "Ritigala forest shrine", date: "2026-07-13", status: "approved" },
  ],
  officer: {
    name: "Field Officer",
    photoUrl: undefined,
  },
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
  const {
    sitesSubmitted,
    pendingReview,
    approved,
    correctionRequested,
    weeklyActivity,
    recentSubmissions,
    officer,
  } = await getDashboardSummary();

  const approvalRate = sitesSubmitted > 0 ? Math.round((approved / sitesSubmitted) * 100) : 0;
  const pendingRate = sitesSubmitted > 0 ? Math.round((pendingReview / sitesSubmitted) * 100) : 0;
  const outstandingRate =
    sitesSubmitted > 0 ? Math.round((correctionRequested / sitesSubmitted) * 100) : 0;
  const maxActivity = Math.max(1, ...weeklyActivity.map((d) => d.count));

  const officerName = officer?.name ?? "Field Officer";
  const officerInitials = officerName
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <>
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">
            Field officer dashboard
          </h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            An overview of your exploration submissions
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden sm:block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#A6A199]" />
            <input
              type="text"
              placeholder="Search sites"
              className="w-56 rounded-[20px] border border-[#D4CFC3] bg-white py-2 pl-9 pr-3.5 text-[13px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
            />
          </div>
          <Link
            href="/field_officer/dashboard/notifications"
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#DEDBD1] bg-white text-[#8A8478] transition hover:border-[#BB892C]/40 hover:text-[#BB892C]"
          >
            <BellIcon />
          </Link>
          <Link
            href="/field_officer/dashboard/profile"
            aria-label="View profile"
            className="relative block h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#DEDBD1] bg-[#F0E6C8] transition hover:border-[#BB892C]/40"
          >
            {officer?.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={officer.photoUrl}
                alt={officerName}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[12px] font-medium text-[#8F6A21]">
                {officerInitials || "FO"}
              </span>
            )}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-7 lg:px-9">
        {/* Stat rings */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RingStat
            label="Sites submitted"
            value={sitesSubmitted}
            percent={100}
            detail="Total to date"
            color="#BB892C"
          />
          <RingStat
            label="Pending review"
            value={pendingReview}
            percent={pendingRate}
            detail={`${pendingRate}% of submissions`}
            color="#9A5A2E"
          />
          <RingStat
            label="Approved"
            value={approved}
            percent={approvalRate}
            detail={`${approvalRate}% approval rate`}
            color="#2C6B33"
          />
        </div>

        {/* Activity + status split */}
        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4.5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">Weekly activity</h2>
                <p className="mt-0.5 text-[11px] text-[#8A8478]">Survey logs registered per day</p>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-serif font-bold text-[#BB892C]">
                  {weeklyActivity.reduce((acc, curr) => acc + curr.count, 0)}
                </span>
                <span className="ml-1 text-[11px] text-[#8A8478]">logged</span>
              </div>
            </div>

            <div className="mt-6 flex h-[160px] gap-3">
              {/* Y-Axis Labels */}
              <div className="flex flex-col justify-between text-[10px] font-medium text-[#8A8478] pb-6 pt-1 select-none pr-1">
                <span>{maxActivity}</span>
                <span>{Math.round(maxActivity / 2)}</span>
                <span>0</span>
              </div>

              {/* Chart Grid & Bars Area */}
              <div className="relative flex-1 h-[160px]">
                {/* Grid Lines */}
                <div className="absolute inset-0 pb-6 pt-2 flex flex-col justify-between pointer-events-none">
                  <div className="w-full border-t border-dashed border-[#DEDBD1]/40" />
                  <div className="w-full border-t border-dashed border-[#DEDBD1]/40" />
                  <div className="w-full border-t border-[#DEDBD1]/60" />
                </div>

                {/* Columns */}
                <div className="absolute inset-0 pb-6 pt-2 flex items-stretch gap-3.5 px-1">
                  {weeklyActivity.map((day) => (
                    <div key={day.label} className="group/bar relative flex flex-1 flex-col justify-end items-center cursor-pointer">
                      {/* Elegant Tooltip */}
                      <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-[5px] bg-[#241708] border border-[#BB892C]/30 px-2 py-1 text-[10px] font-medium text-[#FAC437] opacity-0 scale-95 transition-all duration-200 group-hover/bar:opacity-100 group-hover/bar:scale-100 shadow-md z-10 whitespace-nowrap">
                        {day.count} {day.count === 1 ? "site" : "sites"}
                      </div>
                      {/* Bar */}
                      <div className="w-full flex-1 flex items-end justify-center">
                        <div
                          className="w-4 rounded-t-[5px] bg-gradient-to-t from-[#D9A05B] to-[#BB892C] transition-all duration-300 group-hover/bar:from-[#BB892C] group-hover/bar:to-[#FAC437] group-hover/bar:shadow-[0_0_12px_rgba(187,137,44,0.4)] border border-[#BB892C]/10"
                          style={{
                            height: `${Math.max(6, (day.count / maxActivity) * 100)}%`,
                          }}
                        />
                      </div>
                      {/* Label */}
                      <span className="absolute -bottom-5 text-[11px] font-medium text-[#8A8478] transition-colors group-hover/bar:text-[#BB892C]">
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4.5">
            <h2 className="text-[14px] font-medium text-[#3A2A12]">Submission status</h2>
            <div className="mt-4 space-y-4">
              <StatusRow
                label="Approved"
                value={approved}
                percent={approvalRate}
                color="#2C6B33"
                bg="#EAF3EA"
              />
              <StatusRow
                label="Pending"
                value={pendingReview}
                percent={pendingRate}
                color="#9A5A2E"
                bg="#FBF0EB"
              />
              <StatusRow
                label="Correction requested"
                value={correctionRequested}
                percent={outstandingRate}
                color="#B03A2E"
                bg="#FBEBEA"
              />
            </div>
          </div>
        </div>

        {/* Recent submissions */}
        <section className="mt-5">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-medium text-[#3A2A12]">Recent submissions</h2>
            <Link
              href="/field_officer/dashboard/records"
              className="text-[13px] font-medium text-[#BB892C] hover:underline"
            >
              View all
            </Link>
          </div>

          <div className="mt-3 overflow-hidden rounded-[10px] border border-[#DEDBD1] bg-white">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#3A2A12] text-[#F4F2ED]">
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
                      className={"transition-colors duration-200 hover:bg-[#FAF6EB]/60 cursor-pointer " + (i % 2 === 1 ? "bg-[#FAF6EB]" : "")}
                    >
                      <td className="px-4 py-2.5 text-[#23262B]">{s.siteName}</td>
                      <td className="px-4 py-2.5 text-[#5B6472]">{formatDate(s.date)}</td>
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
          href="/field_officer/dashboard/new-site"
          className="group mt-6 inline-flex items-center gap-2 rounded-[20px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md hover:bg-[#8F6A21]"
        >
          <span className="transition-transform duration-300 group-hover:rotate-90">
            <PlusIcon />
          </span>
          Register new site
        </Link>
      </main>
    </>
  );
}

/* ---------------- components ---------------- */

function RingStat({
  label,
  value,
  percent,
  detail,
  color,
}: {
  label: string;
  value: number;
  percent: number;
  detail: string;
  color: string;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="group relative flex items-center gap-4 rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4.5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BB892C]/30 hover:shadow-md cursor-default overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#FAF6EB]/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      
      <div
        className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full transition-transform duration-300 group-hover:scale-105"
        style={{
          background: `conic-gradient(${color} ${clamped * 3.6}deg, #EFE9D6 0deg)`,
        }}
      >
        <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white">
          <span className="text-[13px] font-medium text-[#3A2A12]">{clamped}%</span>
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[13px] text-[#5B6472]">{label}</p>
        <p className="mt-0.5 font-serif text-[24px] leading-none text-[#3A2A12] transition-colors group-hover:text-[#BB892C]">{value}</p>
        <p className="mt-1 text-[11px] text-[#8A8478]">{detail}</p>
      </div>
    </div>
  );
}

function StatusRow({
  label,
  value,
  percent,
  color,
  bg,
}: {
  label: string;
  value: number;
  percent: number;
  color: string;
  bg: string;
}) {
  return (
    <div className="group/row transition-all duration-200 hover:translate-x-1 cursor-default">
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[#3A2A12] transition-colors group-hover/row:text-[#BB892C]">{label}</span>
        <span className="font-medium" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full transition-all duration-300" style={{ background: bg }}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out group-hover/row:brightness-110 group-hover/row:shadow-[0_0_4px_currentColor]"
          style={{ width: `${Math.max(4, percent)}%`, backgroundColor: color } as any}
        />
      </div>
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

/* ---------------- icons (header/button only — nav icons live in layout.tsx) ---------------- */

function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
      <path d="m21 21-3.6-3.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M10 19a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}