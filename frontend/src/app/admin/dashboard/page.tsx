import Link from "next/link";
import StatCard from "@/src/components/dashboard/StatCard";
import QuickLinkCard from "@/src/components/dashboard/QuickLinkCard";
import ActivityTimeline from "@/src/components/dashboard/ActivityTimeline";

/**
 * Admin dashboard — /admin/dashboard
 * Department of Archaeology, Sri Lanka
 *
 * Server component that fetches summary stats and exploration approvals.
 * Falls back to placeholder mock data if the API is not active.
 */

const DASHBOARD_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/admin/dashboard-summary`;

type PendingApproval = {
  id: string;
  siteName: string;
  submittedBy: string;
  date: string;
};

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  status: "completed" | "pending" | "alert" | "info";
};

type AdminDashboardData = {
  totalUsers: number;
  totalExplorationSites: number;
  pendingApprovalsCount: number;
  highRiskAreas: number;
  pendingApprovals: PendingApproval[];
  recentActivities: ActivityItem[];
};

const FALLBACK_DATA: AdminDashboardData = {
  totalUsers: 24,
  totalExplorationSites: 248,
  pendingApprovalsCount: 7,
  highRiskAreas: 12,
  pendingApprovals: [
    { id: "site1", siteName: "Anuradhapura North", submittedBy: "J. Perera", date: "2026-07-01" },
    { id: "site2", siteName: "Sigiriya East Ridge", submittedBy: "K. Silva", date: "2026-07-05" },
    { id: "site3", siteName: "Polonnaruwa Canal Site", submittedBy: "J. Perera", date: "2026-07-09" },
    { id: "site4", siteName: "Yapahuwa Terrace Wall", submittedBy: "R. Bandara", date: "2026-07-11" },
  ],
  recentActivities: [
    {
      id: "act1",
      title: "Exploration Record Approved",
      detail: "Approved site survey for 'Ritigala Forest Shrine' submitted by J. Perera.",
      timestamp: "3 hours ago",
      status: "completed",
    },
    {
      id: "act2",
      title: "New User Provisioned",
      detail: "Created new Field Officer account 'j.wijesinghe' and assigned exploration access.",
      timestamp: "1 day ago",
      status: "completed",
    },
    {
      id: "act3",
      title: "System Backup Successful",
      detail: "Automated daily backup of spatial database and user records completed.",
      timestamp: "1 day ago",
      status: "completed",
    },
    {
      id: "act4",
      title: "Password Reset Approved",
      detail: "Approved password reset request and issued temp token for Analyst 'k.silva'.",
      timestamp: "2 days ago",
      status: "completed",
    },
  ],
};

async function getDashboardData(): Promise<AdminDashboardData> {
  try {
    const res = await fetch(DASHBOARD_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return FALLBACK_DATA;
    return (await res.json()) as AdminDashboardData;
  } catch {
    return FALLBACK_DATA;
  }
}

export default async function AdminDashboardPage() {
  const {
    totalUsers,
    totalExplorationSites,
    pendingApprovalsCount,
    highRiskAreas,
    pendingApprovals,
    recentActivities,
  } = await getDashboardData();

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">
            Admin dashboard
          </h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            Department control panel for user accounts, site approvals, and system health
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard/notifications"
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#DEDBD1] bg-white text-[#8A8478] transition hover:border-[#BB892C]/40 hover:text-[#BB892C]"
          >
            <BellIcon />
          </Link>
          <Link
            href="/admin/dashboard/profile"
            aria-label="View profile"
            className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#DEDBD1] bg-[#F0E6C8] items-center justify-center transition hover:border-[#BB892C]/40"
          >
            <span className="text-[12px] font-medium text-[#8F6A21] font-semibold">
              NF
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-7 lg:px-9 bg-[#F0E6C8]">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={totalUsers}
            detail="Active system accounts"
            colorClass="text-[#3A2A12]"
            icon={<UsersIcon />}
          />
          <StatCard
            label="Total Exploration Sites"
            value={totalExplorationSites}
            detail="Sites registered on database"
            colorClass="text-[#BB892C]"
            icon={<MapPinIcon />}
          />
          <StatCard
            label="Pending Approvals"
            value={pendingApprovalsCount}
            detail="Reports requiring sign-off"
            colorClass="text-[#9A5A2E]"
            icon={<DocIcon />}
          />
          <StatCard
            label="High-Risk Areas"
            value={highRiskAreas}
            detail="Under active threat overlay"
            colorClass="text-[#B03A2E]"
            icon={<AlertIcon />}
          />
        </section>

        {/* Dashboard Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left Column: Quick Actions & Pending Approvals */}
          <div className="space-y-5 lg:col-span-2">
            {/* Quick Actions */}
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5">
              <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
                System Administration Actions
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <QuickLinkCard
                  href="/admin/dashboard/users"
                  title="User Management"
                  description="Provision user accounts, assign database roles, and monitor status."
                  icon={<UsersIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/admin/dashboard/decisions"
                  title="Exploration Review & Approval"
                  description="Review pending survey records and issue approvals or corrections."
                  icon={<StampIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/admin/dashboard/decisions"
                  title="Decision Support Dashboard"
                  description="Access prioritize site listings and policy planning parameters."
                  icon={<BalanceIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/admin/dashboard/gis-map"
                  title="GIS Map View"
                  description="Interact with the global spatial coordinate system and heritage maps."
                  icon={<MapIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/admin/dashboard/reports"
                  title="Monitor High-Risk Areas"
                  description="Review threat analytics, flooding risk indicators, and mitigation plans."
                  icon={<ShieldIcon />}
                  theme="warm"
                />
              </div>
            </div>

            {/* Pending Approvals Table */}
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5">
              <div className="flex items-center justify-between">
                <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
                  Pending Approvals Queue
                </h2>
                <Link
                  href="/admin/dashboard/decisions"
                  className="text-[13px] font-medium text-[#BB892C] hover:underline"
                >
                  Manage queue ({pendingApprovalsCount})
                </Link>
              </div>

              <div className="mt-4 overflow-hidden rounded-[8px] border border-[#DEDBD1]">
                {pendingApprovals.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">
                    No exploration reports are waiting on review.
                  </p>
                ) : (
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="bg-[#3A2A12] text-[12px] text-[#F4F2ED]">
                        <th className="px-5 py-3 font-medium">Site Name</th>
                        <th className="px-5 py-3 font-medium">Submitted By</th>
                        <th className="px-5 py-3 font-medium">Date</th>
                        <th className="px-5 py-3 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDBD1]/60">
                      {pendingApprovals.map((approval, i) => (
                        <tr
                          key={approval.id}
                          className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}
                        >
                          <td className="px-5 py-3 text-[#3A2A12] font-medium">{approval.siteName}</td>
                          <td className="px-5 py-3 text-[#3A4048]">{approval.submittedBy}</td>
                          <td className="px-5 py-3 text-[#5B6472]">{formatDate(approval.date)}</td>
                          <td className="px-5 py-3 text-right">
                            <Link
                              href={`/admin/dashboard/decisions/${approval.id}`}
                              className="inline-flex items-center rounded bg-[#3A2A12]/5 px-2.5 py-1 text-[12px] font-medium text-[#3A2A12] hover:bg-[#3A2A12]/10 transition"
                            >
                              Review
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Recent Activities */}
          <div className="space-y-5 lg:col-span-1">
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5">
              <h2 className="mb-5 text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
                System Log Activities
              </h2>
              <ActivityTimeline activities={recentActivities} />
            </div>

            {/* Admin Stats Info card */}
            <div className="rounded-[10px] border border-[#DEDBD1] bg-[#FAF6EB]/40 p-5">
              <h3 className="font-serif text-[15px] font-medium text-[#3A2A12]">
                Exploration Management System
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-[#8A8478]">
                This administrative workspace controls user roles, handles report validations, and provides access keys for field data collection.
              </p>
              <div className="mt-4 text-[11px] text-[#A6A199] border-t border-[#DEDBD1] pt-3">
                Current Time: <span className="font-medium text-[#5B6472]">July 2026</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ---------------- helper methods ---------------- */

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

/* ---------------- icons ---------------- */

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function MapPinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 22 22 22" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

function DocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function StampIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22v-9" />
      <path d="M5 13a7 7 0 0 1 14 0" />
      <path d="M3 21h18" />
      <path d="M6 17h12" />
    </svg>
  );
}

function BalanceIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="5" y1="9" x2="19" y2="9" />
      <line x1="5" y1="15" x2="19" y2="15" />
    </svg>
  );
}

function MapIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}