"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import StatCard from "@/src/components/dashboard/StatCard";
import QuickLinkCard from "@/src/components/dashboard/QuickLinkCard";
import {
  apiErrorMessage,
  getSiteDashboard,
  listSites,
  SITE_STATUS_LABELS,
  type SiteDashboardStats,
  type SiteListItem,
} from "@/lib/sites";
import { getUserCount } from "@/lib/users";

/**
 * Admin dashboard — /admin/dashboard
 *
 * Total users:   GET /api/users pagination total (ADMIN only)
 * Site counts:   GET /api/sites/dashboard (system-wide for admin)
 * Pending list:  GET /api/sites?status=PENDING (read-only — admin has no
 *                review route yet; see the flag in the PR notes)
 */

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<SiteDashboardStats | null>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [pending, setPending] = useState<SiteListItem[]>([]);
  const [recent, setRecent] = useState<SiteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const [dashboard, count, pendingSites, allSites] = await Promise.all([
          getSiteDashboard(),
          getUserCount().catch(() => null),
          listSites({ status: "PENDING" }),
          listSites(),
        ]);
        if (isMounted) {
          setStats(dashboard);
          setUserCount(count);
          setPending(pendingSites);
          setRecent(allSites.slice(0, 6));
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(apiErrorMessage(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, []);

  const adminName = user ? `${user.firstName} ${user.lastName}`.trim() : "Administrator";
  const initials =
    adminName
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AD";

  const dash = (n?: number) => (isLoading ? "—" : (n ?? 0));

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">Admin dashboard</h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            User accounts, site approvals, and system overview
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
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] text-[12px] font-semibold text-[#8F6A21] transition hover:border-[#BB892C]/40"
          >
            {initials}
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-[#F0E6C8] px-6 py-7 lg:px-9">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-[8px] border border-[#E3B9A8] bg-[#FBF0EB] px-4 py-3 text-[13px] text-[#8A3A20]"
          >
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Users"
            value={userCount === null ? (isLoading ? "—" : "n/a") : userCount}
            detail="Registered system accounts"
            colorClass="text-[#3A2A12]"
            icon={<UsersIcon />}
          />
          <StatCard
            label="Total Sites"
            value={dash(stats?.total)}
            detail="Sites in the database"
            colorClass="text-[#BB892C]"
            icon={<MapPinIcon />}
          />
          <StatCard
            label="Pending Approvals"
            value={dash(stats?.pending)}
            detail="Awaiting senior officer review"
            colorClass="text-[#9A5A2E]"
            icon={<DocIcon />}
          />
          <StatCard
            label="Approved Sites"
            value={dash(stats?.approved)}
            detail="Authorized into the database"
            colorClass="text-[#2C6B33]"
            icon={<CheckIcon />}
          />
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5">
              <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#3A2A12]">
                Administration
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <QuickLinkCard
                  href="/admin/dashboard/users"
                  title="User Management"
                  description="Provision accounts, assign roles, and manage account status."
                  icon={<UsersIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/admin/dashboard/gis-map"
                  title="GIS Map View"
                  description="View all registered sites on the national spatial map."
                  icon={<MapIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/admin/dashboard/decisions"
                  title="Decision Support"
                  description="Prioritised site listings and planning parameters."
                  icon={<BalanceIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/admin/dashboard/reports"
                  title="Reports"
                  description="Generated summaries and exports."
                  icon={<DocIcon />}
                  theme="warm"
                />
              </div>
            </div>

            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5">
              <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#3A2A12]">
                Pending approvals ({isLoading ? "…" : pending.length})
              </h2>
              <p className="mt-1 text-[12px] text-[#8A8478]">
                Read-only. Approvals are actioned by senior officers.
              </p>

              <div className="mt-4 overflow-hidden rounded-[8px] border border-[#DEDBD1]">
                {isLoading ? (
                  <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">Loading…</p>
                ) : pending.length === 0 ? (
                  <p className="px-5 py-8 text-center text-[13px] text-[#8A8D86]">
                    No exploration reports are waiting on review.
                  </p>
                ) : (
                  <table className="w-full text-left text-[13px]">
                    <thead>
                      <tr className="bg-[#3A2A12] text-[12px] text-[#F4F2ED]">
                        <th className="px-5 py-3 font-medium">Site</th>
                        <th className="px-5 py-3 font-medium">Code</th>
                        <th className="px-5 py-3 font-medium">Registered by</th>
                        <th className="px-5 py-3 font-medium">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDBD1]/60">
                      {pending.map((s, i) => (
                        <tr key={s.id} className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}>
                          <td className="px-5 py-3 font-medium text-[#3A2A12]">{s.name}</td>
                          <td className="px-5 py-3 font-mono text-[12px] text-[#5B6472]">{s.siteCode}</td>
                          <td className="px-5 py-3 text-[#3A4048]">
                            {s.createdBy ? `${s.createdBy.firstName} ${s.createdBy.lastName}` : "—"}
                          </td>
                          <td className="px-5 py-3 text-[#5B6472]">{formatDate(s.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-5 lg:col-span-1">
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5">
              <h2 className="text-[13px] font-medium text-[#3A2A12]">Sites by status</h2>
              <div className="mt-3 space-y-2 text-[12.5px]">
                {(["APPROVED", "PENDING", "DRAFT", "REJECTED"] as const).map((k) => (
                  <div key={k} className="flex justify-between border-b border-[#DEDBD1]/40 pb-1 last:border-0">
                    <span className="text-[#8A8478]">{SITE_STATUS_LABELS[k]}</span>
                    <span className="font-semibold text-[#3A2A12]">
                      {dash(
                        k === "APPROVED"
                          ? stats?.approved
                          : k === "PENDING"
                          ? stats?.pending
                          : k === "DRAFT"
                          ? stats?.draft
                          : stats?.rejected
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5">
              <h2 className="mb-3 text-[13px] font-medium text-[#3A2A12]">Recently updated sites</h2>
              <div className="divide-y divide-[#DEDBD1]/60">
                {isLoading ? (
                  <p className="py-3 text-[13px] text-[#8A8D86]">Loading…</p>
                ) : recent.length === 0 ? (
                  <p className="py-3 text-[13px] text-[#8A8D86]">No sites yet.</p>
                ) : (
                  recent.map((s) => (
                    <div key={s.id} className="flex items-center justify-between gap-2 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-[#3A2A12]">{s.name}</p>
                        <p className="text-[11px] text-[#8A8478]">
                          {s.district} · {formatDate(s.updatedAt)}
                        </p>
                      </div>
                      <span className="shrink-0 text-[11px] font-semibold text-[#8A8478]">
                        {SITE_STATUS_LABELS[s.status]}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
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
