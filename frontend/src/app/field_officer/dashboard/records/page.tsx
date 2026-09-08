"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiErrorMessage,
  isEditable,
  listMySites,
  SITE_STATUS_LABELS,
  type SiteListItem,
  type SiteStatus,
} from "@/lib/sites";

type FilterKey = "all" | SiteStatus;

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "PENDING", label: "Pending review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
];

export default function MyRecordsPage() {
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = await listMySites();
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

  const filtered = sites.filter((s) => {
    if (activeFilter !== "all" && s.status !== activeFilter) return false;
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      if (!s.name.toLowerCase().includes(q) && !s.siteCode.toLowerCase().includes(q))
        return false;
    }
    return true;
  });

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">My records</h1>
        <Link
          href="/field_officer/dashboard/new-site"
          className="inline-flex items-center gap-2 rounded-[6px] bg-[#BB892C] px-3.5 py-2 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21]"
        >
          <PlusIcon />
          Register new site
        </Link>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <div className="mb-4 flex items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by site name or code…"
            className="w-full max-w-[320px] rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2 text-[13px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          />
          <button
            type="button"
            onClick={reload}
            className="rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB]"
          >
            Refresh
          </button>
        </div>

        <nav className="mb-5 flex flex-wrap gap-1.5" aria-label="Filter records by status">
          {FILTERS.map((f) => {
            const isActive = f.key === activeFilter;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setActiveFilter(f.key)}
                className={
                  "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition " +
                  (isActive
                    ? "bg-[#BB892C] text-[#F4F2ED]"
                    : "border border-[#DEDBD1] bg-white text-[#5B6472] hover:border-[#BB892C]/40 hover:text-[#BB892C]")
                }
              >
                {f.label}
              </button>
            );
          })}
        </nav>

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
                <th className="px-4 py-2.5 font-medium">Site name</th>
                <th className="px-4 py-2.5 font-medium">Site code</th>
                <th className="px-4 py-2.5 font-medium">District</th>
                <th className="px-4 py-2.5 font-medium">Last updated</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8A8D86]">
                    Loading your records…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8A8D86]">
                    {sites.length === 0
                      ? "You haven't registered any sites yet."
                      : "No records match this filter."}
                  </td>
                </tr>
              ) : (
                filtered.map((s, i) => (
                  <tr key={s.id} className={i % 2 === 1 ? "bg-[#FAF9F6]" : undefined}>
                    <td className="px-4 py-2.5 font-semibold text-[#23262B]">{s.name}</td>
                    <td className="px-4 py-2.5 font-mono text-[12px] text-[#5B6472]">{s.siteCode}</td>
                    <td className="px-4 py-2.5 text-[#5B6472]">{s.district}</td>
                    <td className="px-4 py-2.5 text-[#5B6472]">{formatDate(s.updatedAt)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      {isEditable(s.status) ? (
                        <Link
                          href={`/field_officer/dashboard/records/${s.id}/edit`}
                          className="text-[13px] font-medium text-[#BB892C] hover:underline"
                        >
                          Continue editing
                        </Link>
                      ) : (
                        <Link
                          href={`/field_officer/dashboard/records/${s.id}`}
                          className="text-[13px] font-medium text-[#BB892C] hover:underline"
                        >
                          View details
                        </Link>
                      )}
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
      className="inline-block rounded-[4px] border border-black/5 px-2 py-0.5 text-[12px] font-medium"
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

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}
