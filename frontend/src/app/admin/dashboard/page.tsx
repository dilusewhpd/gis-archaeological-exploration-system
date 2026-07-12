import Link from "next/link";

/**
 * Admin dashboard — /admin/dashboard
 *
 * Server component: fetches summary stats and exploration submissions
 * awaiting admin review. Replace DASHBOARD_ENDPOINT with your real API
 * route; falls back to placeholder data (matching the wireframe numbers)
 * if the request fails.
 *
 * Use-case mapping: the "Pending approvals" table surfaces exploration
 * sites in the "Review exploration records" / "Approve exploration
 * report" flow (Exploration Management module) — rows link through to
 * the full review screen rather than approving inline here.
 */

const DASHBOARD_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/admin/dashboard-summary`;

type PendingApproval = {
  id: string;
  siteName: string;
  submittedBy: string;
  date: string;
};

type AdminDashboardData = {
  totalUsers: number;
  sitesTotal: number;
  pendingApprovalsCount: number;
  highRiskZones: number;
  pendingApprovals: PendingApproval[];
};

const FALLBACK_DATA: AdminDashboardData = {
  totalUsers: 24,
  sitesTotal: 248,
  pendingApprovalsCount: 7,
  highRiskZones: 12,
  pendingApprovals: [
    { id: "site1", siteName: "Anuradhapura North", submittedBy: "J. Perera", date: "2026-07-01" },
    { id: "site2", siteName: "Sigiriya East ridge", submittedBy: "K. Silva", date: "2026-07-05" },
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
  const { totalUsers, sitesTotal, pendingApprovalsCount, highRiskZones, pendingApprovals } =
    await getDashboardData();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">Admin dashboard</h1>
        <Link
          href="/admin/dashboard/profile"
          aria-label="View profile"
          className="h-8 w-8 rounded-full border border-[#DEDBD1] bg-[#F4F3EF] transition hover:border-[#16283F]/30"
        />
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total users" value={totalUsers} />
          <StatCard label="Sites total" value={sitesTotal} />
          <StatCard label="Pending approvals" value={pendingApprovalsCount} />
          <StatCard label="High risk zones" value={highRiskZones} />
        </div>

        {/* Pending approvals */}
        <div className="mt-6">
          <h2 className="text-[14px] font-medium text-[#16283F]">Pending approvals</h2>

          <div className="mt-3 overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
            {pendingApprovals.length === 0 ? (
              <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">
                No exploration reports are waiting on review.
              </p>
            ) : (
              <table className="w-full text-left text-[13px]">
                <thead>
                  <tr className="bg-[#16283F] text-[12px] text-[#F4F2ED]">
                    <th className="px-5 py-3 font-medium">Site name</th>
                    <th className="px-5 py-3 font-medium">Submitted by</th>
                    <th className="px-5 py-3 font-medium">Date</th>
                    <th className="px-5 py-3 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingApprovals.map((approval, i) => (
                    <tr
                      key={approval.id}
                      className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}
                    >
                      <td className="px-5 py-3 text-[#16283F]">{approval.siteName}</td>
                      <td className="px-5 py-3 text-[#3A4048]">{approval.submittedBy}</td>
                      <td className="px-5 py-3 text-[#3A4048]">{approval.date}</td>
                      <td className="px-5 py-3 text-right">
                        <Link
                          href={`/admin/dashboard/decisions/${approval.id}`}
                          className="text-[13px] font-medium text-[#16283F] underline-offset-2 hover:underline"
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
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4">
      <p className="text-[13px] text-[#5B6472]">{label}</p>
      <p className="mt-1.5 font-serif text-[28px] leading-none text-[#16283F]">{value}</p>
    </div>
  );
}