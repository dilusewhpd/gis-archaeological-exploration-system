"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import {
  apiErrorMessage,
  getSiteDashboard,
  listMySites,
  SITE_STATUS_LABELS,
  type SiteDashboardStats,
  type SiteListItem,
  type SiteStatus,
} from "@/lib/sites";

/**
 * Field Officer dashboard — /field_officer/dashboard
 *
 * Stat cards + status breakdown come from GET /api/sites/dashboard, which
 * the backend scopes to the calling field officer's own sites. "Recent
 * activity" is the officer's most recently updated sites from
 * GET /api/sites/my-sites (already sorted updatedAt desc).
 *
 * NOTE: the old "weekly activity" bar chart was mock-only — there is no
 * backend time-series endpoint for it, so it was removed. If we want it
 * back it needs a real aggregation endpoint (e.g. counts grouped by day).
 */

export default function FieldOfficerDashboardPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState<SiteDashboardStats | null>(null);
  const [recent, setRecent] = useState<SiteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const [dashboard, mySites] = await Promise.all([
          getSiteDashboard(),
          listMySites(),
        ]);
        if (isMounted) {
          setStats(dashboard);
          setRecent(mySites.slice(0, 5));
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

  const officerName = user ? `${user.firstName} ${user.lastName}`.trim() : "Field Officer";
  const officerInitials =
    officerName
      .split(" ")
      .map((p) => p[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "FO";

  const total = stats?.total ?? 0;
  const pct = (n: number) => (total > 0 ? Math.round((n / total) * 100) : 0);

  return (
    <>
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
            className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full border border-[#DEDBD1] bg-[#F0E6C8] text-[12px] font-medium text-[#8F6A21] transition hover:border-[#BB892C]/40"
          >
            {officerInitials}
          </Link>
        </div>
      </header>

      <main className="flex-1 px-6 py-7 lg:px-9">
        {error && (
          <div
            role="alert"
            className="mb-5 rounded-[8px] border border-[#E3B9A8] bg-[#FBF0EB] px-4 py-3 text-[13px] text-[#8A3A20]"
          >
            {error}
          </div>
        )}

        {/* Stat rings */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <RingStat
            label="Sites registered"
            value={total}
            percent={100}
            detail="Total to date"
            color="#BB892C"
            loading={isLoading}
          />
          <RingStat
            label="Pending review"
            value={stats?.pending ?? 0}
            percent={pct(stats?.pending ?? 0)}
            detail={`${pct(stats?.pending ?? 0)}% of your sites`}
            color="#9A5A2E"
            loading={isLoading}
          />
          <RingStat
            label="Approved"
            value={stats?.approved ?? 0}
            percent={pct(stats?.approved ?? 0)}
            detail={`${pct(stats?.approved ?? 0)}% approval rate`}
            color="#2C6B33"
            loading={isLoading}
          />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          {/* Recent activity */}
          <section className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4.5">
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-semibold uppercase tracking-wider text-[#3A2A12]">
                Recent activity
              </h2>
              <Link
                href="/field_officer/dashboard/records"
                className="text-[13px] font-medium text-[#BB892C] hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="mt-3 divide-y divide-[#DEDBD1]/60">
              {isLoading ? (
                <p className="py-6 text-center text-[13px] text-[#8A8D86]">Loading…</p>
              ) : recent.length === 0 ? (
                <p className="py-6 text-center text-[13px] text-[#8A8D86]">
                  No sites yet. Register your first site to get started.
                </p>
              ) : (
                recent.map((s) => (
                  <Link
                    key={s.id}
                    href={`/field_officer/dashboard/records/${s.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 transition hover:bg-[#FAF6EB]/60"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-medium text-[#23262B]">{s.name}</p>
                      <p className="text-[11.5px] text-[#8A8478]">
                        {s.siteCode} · updated {formatDate(s.updatedAt)}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </Link>
                ))
              )}
            </div>
          </section>

          {/* Status breakdown */}
          <section className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4.5">
            <h2 className="text-[14px] font-medium text-[#3A2A12]">Your sites by status</h2>
            <div className="mt-4 space-y-4">
              <StatusRow label="Approved" value={stats?.approved ?? 0} percent={pct(stats?.approved ?? 0)} color="#2C6B33" bg="#EAF3EA" />
              <StatusRow label="Pending review" value={stats?.pending ?? 0} percent={pct(stats?.pending ?? 0)} color="#9A5A2E" bg="#FBF0EB" />
              <StatusRow label="Draft" value={stats?.draft ?? 0} percent={pct(stats?.draft ?? 0)} color="#5B6472" bg="#EFEEEA" />
              <StatusRow label="Rejected" value={stats?.rejected ?? 0} percent={pct(stats?.rejected ?? 0)} color="#B03A2E" bg="#FBEBEA" />
            </div>
          </section>
        </div>

        <Link
          href="/field_officer/dashboard/new-site"
          className="group mt-6 inline-flex items-center gap-2 rounded-[20px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#8F6A21] hover:shadow-md"
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
  loading,
}: {
  label: string;
  value: number;
  percent: number;
  detail: string;
  color: string;
  loading?: boolean;
}) {
  const clamped = Math.max(0, Math.min(100, percent));
  return (
    <div className="flex items-center gap-4 rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-4.5 shadow-xs">
      <div
        className="grid h-16 w-16 shrink-0 place-items-center rounded-full"
        style={{ background: `conic-gradient(${color} ${clamped * 3.6}deg, #EFE9D6 0deg)` }}
      >
        <div className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white">
          <span className="text-[13px] font-medium text-[#3A2A12]">{clamped}%</span>
        </div>
      </div>
      <div>
        <p className="text-[13px] text-[#5B6472]">{label}</p>
        <p className="mt-0.5 font-serif text-[24px] leading-none text-[#3A2A12]">
          {loading ? "—" : value}
        </p>
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
    <div>
      <div className="flex items-center justify-between text-[13px]">
        <span className="text-[#3A2A12]">{label}</span>
        <span className="font-medium" style={{ color }}>
          {value}
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full" style={{ background: bg }}>
        <div
          className="h-full rounded-full"
          style={{ width: `${Math.max(4, percent)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: SiteStatus }) {
  const config: Record<SiteStatus, { bg: string; text: string }> = {
    DRAFT: { bg: "#EFEEEA", text: "#5B6472" },
    PENDING: { bg: "#FBF0EB", text: "#9A5A2E" },
    APPROVED: { bg: "#EAF3EA", text: "#2C6B33" },
    REJECTED: { bg: "#FBEBEA", text: "#B03A2E" },
  };
  const { bg, text } = config[status];
  return (
    <span
      className="shrink-0 rounded-[4px] px-2 py-0.5 text-[11.5px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {SITE_STATUS_LABELS[status]}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
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
