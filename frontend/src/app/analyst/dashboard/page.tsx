"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import StatCard from "@/src/components/dashboard/StatCard";
import QuickLinkCard from "@/src/components/dashboard/QuickLinkCard";
import {
  apiErrorMessage,
  getSiteDashboard,
  listSites,
  type SiteDashboardStats,
  type SiteListItem,
} from "@/lib/sites";
import { toTitleCase } from "@/lib/sri-lanka";

/**
 * Analyst dashboard — /analyst/dashboard
 *
 * Analysts have read-only access. Everything here is derived from
 * GET /api/sites/dashboard (system-wide status counts) and
 * GET /api/sites (the full list, aggregated client-side by type /
 * period / province). No risk/AI data — that feature isn't in the
 * backend yet.
 */

export default function AnalystDashboardPage() {
  const [stats, setStats] = useState<SiteDashboardStats | null>(null);
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const [dashboard, allSites] = await Promise.all([getSiteDashboard(), listSites()]);
        if (isMounted) {
          setStats(dashboard);
          setSites(allSites);
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

  const byType = useMemo(() => tally(sites, (s) => toTitleCase(s.siteType)), [sites]);
  const byPeriod = useMemo(() => tally(sites, (s) => toTitleCase(s.historicalPeriod)), [sites]);
  const byProvince = useMemo(() => tally(sites, (s) => s.province), [sites]);

  const dash = (n?: number) => (isLoading ? "—" : (n ?? 0));

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">Analyst dashboard</h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            Read-only overview of registered exploration sites
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/analyst/dashboard/notifications"
            aria-label="Notifications"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#DEDBD1] bg-white text-[#8A8478] transition hover:border-[#BB892C]/40 hover:text-[#BB892C]"
          >
            <BellIcon />
          </Link>
          <Link
            href="/analyst/dashboard/profile"
            aria-label="View profile"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] text-[12px] font-semibold text-[#8F6A21] transition hover:border-[#BB892C]/40"
          >
            AN
          </Link>
        </div>
      </header>

      <main className="flex-1 bg-[#F0E6C8]/30 px-6 py-7 lg:px-9">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-[8px] border border-[#E3B9A8] bg-[#FBF0EB] px-4 py-3 text-[13px] text-[#8A3A20]"
          >
            {error}
          </div>
        )}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Sites" value={dash(stats?.total)} detail="Registered in the database" colorClass="text-[#3A2A12]" icon={<MapPinIcon />} />
          <StatCard label="Approved" value={dash(stats?.approved)} detail="Authorized sites" colorClass="text-[#2C6B33]" icon={<CheckIcon />} />
          <StatCard label="Pending Review" value={dash(stats?.pending)} detail="Awaiting senior officer" colorClass="text-[#9A5A2E]" icon={<DocIcon />} />
          <StatCard label="Rejected" value={dash(stats?.rejected)} detail="Returned to field officers" colorClass="text-[#B03A2E]" icon={<AlertIcon />} />
        </section>

        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            <BreakdownCard title="Sites by type" rows={byType} total={sites.length} loading={isLoading} />
            <BreakdownCard title="Sites by historical period" rows={byPeriod} total={sites.length} loading={isLoading} />
          </div>

          <div className="space-y-5 lg:col-span-1">
            <BreakdownCard title="Sites by province" rows={byProvince} total={sites.length} loading={isLoading} />

            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5 shadow-xs">
              <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#3A2A12]">
                Quick links
              </h2>
              <div className="mt-4 space-y-4">
                <QuickLinkCard
                  href="/analyst/dashboard/gis-map"
                  title="GIS Map View"
                  description="All registered sites on the national spatial map."
                  icon={<MapIcon />}
                  theme="warm"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function tally(
  sites: SiteListItem[],
  key: (s: SiteListItem) => string
): { label: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const s of sites) {
    const k = key(s) || "—";
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

function BreakdownCard({
  title,
  rows,
  total,
  loading,
}: {
  title: string;
  rows: { label: string; count: number }[];
  total: number;
  loading: boolean;
}) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5 shadow-xs">
      <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#3A2A12]">{title}</h2>
      {loading ? (
        <p className="mt-4 text-[13px] text-[#8A8D86]">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-[13px] text-[#8A8D86]">No sites yet.</p>
      ) : (
        <div className="mt-4 space-y-2.5">
          {rows.map((r) => (
            <div key={r.label}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#3A2A12]">{r.label}</span>
                <span className="font-medium text-[#5B6472]">
                  {r.count}
                  {total > 0 && (
                    <span className="ml-1 text-[11px] text-[#A6A199]">
                      ({Math.round((r.count / total) * 100)}%)
                    </span>
                  )}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#EFEEEA]">
                <div
                  className="h-full rounded-full bg-[#BB892C]"
                  style={{ width: `${Math.max(4, (r.count / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BellIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 10.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 14.5 6 10.5Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
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

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 22 22 22" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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
