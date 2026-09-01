"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSites, type ExplorationSite, type RecordStatus } from "@/src/services/siteService";

type FilterType = "ALL" | "SUBMITTED" | "APPROVED" | "NEEDS_CORRECTION" | "REJECTED";

export default function SeniorOfficerDashboard() {
  const [sites, setSites] = useState<ExplorationSite[]>([]);
  const [filter, setFilter] = useState<FilterType>("SUBMITTED");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setSites(getSites());
  }, []);

  const counts = {
    pending: sites.filter(s => s.status === "SUBMITTED").length,
    approved: sites.filter(s => s.status === "APPROVED").length,
    corrections: sites.filter(s => s.status === "NEEDS_CORRECTION").length,
  };

  const filteredSites = sites.filter(s => {
    if (filter !== "ALL" && s.status !== filter) return false;
    if (search.trim() && !s.name.toLowerCase().includes(search.toLowerCase().trim())) return false;
    return true;
  });

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div>
          <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Review & Approval Queue</h1>
          <p className="mt-0.5 text-[12.5px] text-[#8A8478]">Evaluate field exploration reports and authorize site entries into the GIS risk pipeline.</p>
        </div>
      </header>

      {/* Stats row */}
      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-4.5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#8A8478] uppercase font-bold tracking-wider">Awaiting review</p>
              <h3 className="font-serif text-[26px] font-bold text-[#9A5A2E] mt-1">{counts.pending}</h3>
            </div>
            <span className="h-8.5 w-8.5 rounded-full bg-[#FBF0EB] flex items-center justify-center text-[#9A5A2E] font-bold text-[18px]">?</span>
          </div>
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-4.5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#8A8478] uppercase font-bold tracking-wider">Approved sites</p>
              <h3 className="font-serif text-[26px] font-bold text-[#2C6B33] mt-1">{counts.approved}</h3>
            </div>
            <span className="h-8.5 w-8.5 rounded-full bg-[#EAF3EA] flex items-center justify-center text-[#2C6B33] font-bold text-[18px]">&check;</span>
          </div>
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-4.5 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[12px] text-[#8A8478] uppercase font-bold tracking-wider">Needs corrections</p>
              <h3 className="font-serif text-[26px] font-bold text-[#B03A2E] mt-1">{counts.corrections}</h3>
            </div>
            <span className="h-8.5 w-8.5 rounded-full bg-[#FBEBEA] flex items-center justify-center text-[#B03A2E] font-bold text-[18px]">!</span>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#DEDBD1] bg-white p-4">
          <input
            type="text"
            placeholder="Search by site name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-sm rounded-[6px] border border-[#D4CFC3] px-3.5 py-1.5 text-[13px] outline-none focus:border-[#BB892C] focus:ring-1 focus:ring-[#BB892C]/10"
          />

          <div className="flex gap-2">
            {(["SUBMITTED", "APPROVED", "NEEDS_CORRECTION", "REJECTED", "ALL"] as FilterType[]).map((opt) => {
              const labelMap: Record<FilterType, string> = {
                SUBMITTED: "Awaiting review",
                APPROVED: "Approved",
                NEEDS_CORRECTION: "Needs correction",
                REJECTED: "Rejected",
                ALL: "All",
              };
              const isActive = filter === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setFilter(opt)}
                  className={
                    "rounded-[6px] px-3.5 py-1.5 text-[12.5px] font-medium transition " +
                    (isActive
                      ? "bg-[#BB892C] text-[#F4F2ED]"
                      : "border border-[#DEDBD1] bg-white text-[#5B6472] hover:bg-[#FAF6EB]")
                  }
                >
                  {labelMap[opt]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#3A2A12] text-[#F4F2ED]">
                <th className="px-5 py-3 font-medium">Site name</th>
                <th className="px-5 py-3 font-medium">District</th>
                <th className="px-5 py-3 font-medium">Submission date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">AI Risk prediction</th>
                <th className="px-5 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DEDBD1]/60">
              {filteredSites.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-[#8A8D86]">
                    No exploration reports currently in this queue.
                  </td>
                </tr>
              ) : (
                filteredSites.map((site, i) => (
                  <tr key={site.id} className={i % 2 === 1 ? "bg-[#FAF6EB]/20" : undefined}>
                    <td className="px-5 py-3 font-semibold text-[#3A2A12]">{site.name}</td>
                    <td className="px-5 py-3 text-[#5B6472]">{site.district}</td>
                    <td className="px-5 py-3 text-[#5B6472]">{formatDate(site.visitDate)}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={site.status} />
                    </td>
                    <td className="px-5 py-3 font-medium text-[#BB892C]">
                      {site.riskScore !== null ? (
                        <span>{site.riskScore}% ({site.riskBand})</span>
                      ) : (
                        <span className="text-[#8A8D86] italic font-normal text-[12.5px]">Pending approval</span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/senior_officer/dashboard/records/${site.id}`}
                        className="text-[13px] font-semibold text-[#BB892C] hover:underline"
                      >
                        {site.status === "SUBMITTED" ? "Review & Action" : "Inspect details"}
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
      className="inline-block rounded-[4px] px-2.5 py-0.5 text-[11.5px] font-semibold border border-black/5"
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
