"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  apiErrorMessage,
  listSites,
  SITE_STATUS_LABELS,
  type SiteListItem,
  type SiteStatus,
} from "@/lib/sites";

type FilterKey = "PENDING" | "APPROVED" | "REJECTED" | "DRAFT" | "ALL";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "PENDING", label: "Awaiting review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "DRAFT", label: "Drafts" },
  { key: "ALL", label: "All" },
];

export default function SeniorOfficerDashboard() {
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("PENDING");
  const [search, setSearch] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = await listSites();
        if (isMounted) {
          setSites(data);
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
  }, [reloadKey]);

  function reload() {
    setIsLoading(true);
    setReloadKey((k) => k + 1);
  }

  const counts = {
    pending: sites.filter((s) => s.status === "PENDING").length,
    approved: sites.filter((s) => s.status === "APPROVED").length,
    rejected: sites.filter((s) => s.status === "REJECTED").length,
  };

  const filtered = sites.filter((s) => {
    if (filter !== "ALL" && s.status !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      if (!s.name.toLowerCase().includes(q) && !s.siteCode.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Review &amp; Approval Queue</h1>
        <p className="mt-0.5 text-[12.5px] text-[#8A8478]">
          Evaluate submitted exploration reports and authorize site entries.
        </p>
      </header>

      <main className="flex-1 bg-[#F0E6C8]/30 px-8 py-7">
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label="Awaiting review" value={counts.pending} tone="#9A5A2E" bg="#FBF0EB" />
          <StatCard label="Approved sites" value={counts.approved} tone="#2C6B33" bg="#EAF3EA" />
          <StatCard label="Rejected sites" value={counts.rejected} tone="#B03A2E" bg="#FBEBEA" />
        </div>

        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#DEDBD1] bg-white p-4">
          <div className="flex items-center gap-3">
            <input
              type="search"
              placeholder="Search by site name or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full max-w-sm rounded-[6px] border border-[#D4CFC3] px-3.5 py-1.5 text-[13px] outline-none focus:border-[#BB892C] focus:ring-1 focus:ring-[#BB892C]/10"
            />
            <button
              type="button"
              onClick={reload}
              className="rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-1.5 text-[13px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB]"
            >
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => {
              const isActive = filter === f.key;
              return (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={
                    "rounded-[6px] px-3.5 py-1.5 text-[12.5px] font-medium transition " +
                    (isActive
                      ? "bg-[#BB892C] text-[#F4F2ED]"
                      : "border border-[#DEDBD1] bg-white text-[#5B6472] hover:bg-[#FAF6EB]")
                  }
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
          >
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#3A2A12] text-[#F4F2ED]">
                <th className="px-5 py-3 font-medium">Site name</th>
                <th className="px-5 py-3 font-medium">Site code</th>
                <th className="px-5 py-3 font-medium">District</th>
                <th className="px-5 py-3 font-medium">Registered by</th>
                <th className="px-5 py-3 font-medium">Last updated</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDBD1]/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#8A8D86]">
                    Loading sites…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-[#8A8D86]">
                    {sites.length === 0
                      ? "No sites in the system yet."
                      : "No sites match this filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 1 ? "bg-[#FAF6EB]/20" : undefined}>
                    <td className="px-5 py-3 font-semibold text-[#3A2A12]">{s.name}</td>
                    <td className="px-5 py-3 font-mono text-[12px] text-[#5B6472]">{s.siteCode}</td>
                    <td className="px-5 py-3 text-[#5B6472]">{s.district}</td>
                    <td className="px-5 py-3 text-[#5B6472]">
                      {s.createdBy ? `${s.createdBy.firstName} ${s.createdBy.lastName}` : "—"}
                    </td>
                    <td className="px-5 py-3 text-[#5B6472]">{formatDate(s.updatedAt)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/senior_officer/dashboard/records/${s.id}`}
                        className="text-[13px] font-semibold text-[#BB892C] hover:underline"
                      >
                        {s.status === "PENDING" ? "Review & action" : "Inspect details"}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  label, value, tone, bg,
}: {
  label: string; value: number; tone: string; bg: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-wider text-[#8A8478]">{label}</p>
        <h3 className="mt-1 font-serif text-[26px] font-bold" style={{ color: tone }}>{value}</h3>
      </div>
      <span
        className="flex h-9 w-9 items-center justify-center rounded-full text-[15px] font-bold"
        style={{ backgroundColor: bg, color: tone }}
      >
        {value}
      </span>
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
      className="inline-block rounded-[4px] border border-black/5 px-2.5 py-0.5 text-[11.5px] font-semibold"
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
