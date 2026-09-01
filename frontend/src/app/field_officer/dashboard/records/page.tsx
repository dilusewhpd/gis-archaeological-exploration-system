"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getSites, type ExplorationSite, type RecordStatus } from "@/src/services/siteService";

type FilterKey = "all" | "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "NEEDS_CORRECTION";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "All" },
  { key: "DRAFT", label: "Drafts" },
  { key: "SUBMITTED", label: "Pending review" },
  { key: "APPROVED", label: "Approved" },
  { key: "REJECTED", label: "Rejected" },
  { key: "NEEDS_CORRECTION", label: "Needs correction" },
];

export default function MyRecordsPage() {
  const [sites, setSites] = useState<ExplorationSite[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    setSites(getSites());
  }, []);

  const filteredRecords = sites.filter((r) => {
    if (activeFilter !== "all" && r.status !== activeFilter) return false;
    if (query.trim() && !r.name.toLowerCase().includes(query.toLowerCase().trim())) return false;
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
        {/* Search */}
        <div className="mb-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by site name…"
            className="w-full max-w-[320px] rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2 text-[13px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          />
        </div>

        {/* Filter tabs */}
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

        {/* Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#3A2A12] text-[#F4F2ED]">
                <th className="px-4 py-2.5 font-medium">Site name</th>
                <th className="px-4 py-2.5 font-medium">District</th>
                <th className="px-4 py-2.5 font-medium">Visit date</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Risk Score / Band</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8A8D86]">
                    No records match this filter.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 1 ? "bg-[#FAF9F6]" : undefined}>
                    <td className="px-4 py-2.5 text-[#23262B] font-semibold">{r.name}</td>
                    <td className="px-4 py-2.5 text-[#5B6472]">{r.district ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#5B6472]">{formatDate(r.visitDate)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.status} />
                      {r.status === "NEEDS_CORRECTION" && r.reviewComments && (
                        <p className="mt-1 max-w-[220px] text-[11.5px] leading-snug text-[#B03A2E]">
                          Comment: {r.reviewComments}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5">
                      {r.status === "APPROVED" && r.riskScore !== null ? (
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="text-[13px] font-bold text-[#BB892C]">{r.riskScore}%</span>
                          <span className="text-[11px] text-[#8A8D86] font-normal">({r.riskBand})</span>
                        </span>
                      ) : (
                        <span className="text-[#8A8D86] italic text-[12px]">Pending approval</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <RecordAction record={r} />
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

function RecordAction({ record }: { record: ExplorationSite }) {
  if (record.status === "DRAFT" || record.status === "NEEDS_CORRECTION") {
    return (
      <Link
        href={`/field_officer/dashboard/records/${record.id}/edit`}
        className="text-[13px] font-medium text-[#BB892C] hover:underline"
      >
        Continue editing
      </Link>
    );
  }
  return (
    <Link
      href={`/field_officer/dashboard/records/${record.id}`}
      className="text-[13px] font-medium text-[#BB892C] hover:underline"
    >
      View details
    </Link>
  );
}

function StatusBadge({ status }: { status: RecordStatus }) {
  const config: Record<RecordStatus, { label: string; bg: string; text: string }> = {
    DRAFT: { label: "Draft", bg: "#EFEEEA", text: "#5B6472" },
    SUBMITTED: { label: "Submitted", bg: "#FBF0EB", text: "#9A5A2E" },
    APPROVED: { label: "Approved", bg: "#EAF3EA", text: "#2C6B33" },
    REJECTED: { label: "Rejected", bg: "#FBEBEA", text: "#B03A2E" },
    NEEDS_CORRECTION: { label: "Correction requested", bg: "#FBEBEA", text: "#B03A2E" },
  };
  const { label, bg, text } = config[status];

  return (
    <span
      className="inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-medium border border-black/5"
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