"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSiteById, type ExplorationSite } from "@/src/services/siteService";

export default function RecordDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;
  const [site, setSite] = useState<ExplorationSite | null>(null);

  useEffect(() => {
    const data = getSiteById(siteId);
    if (data) {
      setSite(data);
    }
  }, [siteId]);

  if (!site) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8A8D86]">
        Site record not found…
      </div>
    );
  }

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4 print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/field_officer/dashboard/records" className="text-[13px] text-[#BB892C] hover:underline">
            &larr; Back to records
          </Link>
          <span className="text-[#8A8D86] font-light">/</span>
          <span className="text-[13.5px] text-[#3A2A12] font-semibold">Site details</span>
        </div>
        <button
          onClick={handlePrint}
          className="rounded-[6px] bg-[#BB892C] px-4 py-2 text-[13px] font-medium text-[#F4F2ED] hover:bg-[#8F6A21] transition"
        >
          Print Site Report
        </button>
      </header>

      {/* Main card */}
      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30 print:bg-white print:p-0">
        <div className="max-w-4xl mx-auto rounded-[10px] border border-[#DEDBD1] bg-white p-8 shadow-xs print:border-none print:shadow-none">
          
          {/* Print Heading (only visible during print) */}
          <div className="hidden print:block border-b-2 border-[#3A2A12] pb-4 mb-6">
            <h2 className="font-serif text-[24px] uppercase tracking-wide text-[#3A2A12]">Department of Archaeology, Sri Lanka</h2>
            <p className="text-[12px] text-[#5B6472] uppercase font-bold tracking-wider mt-1">Exploration Management & Risk Assessment Site Report</p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DEDBD1]/60 pb-4 mb-6 gap-2">
            <div>
              <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">{site.name}</h1>
              <p className="text-[13px] text-[#8A8D86] mt-0.5">District: {site.district}</p>
            </div>
            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[11px] text-[#8A8D86] uppercase font-semibold">Status</span>
              <div className="mt-1">
                <StatusBadge status={site.status} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Details panel */}
            <div className="md:col-span-2 space-y-5">
              <div>
                <h3 className="text-[12.5px] uppercase font-bold text-[#3A2A12] tracking-wider">Exploration Notes</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-[#5B6472] whitespace-pre-line bg-[#FAF9F6] p-4 rounded-[6px] border border-[#DEDBD1]/30">
                  {site.notes || "No exploration notes recorded."}
                </p>
              </div>

              {site.reviewComments && (
                <div className="rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] p-4">
                  <h4 className="text-[12.5px] font-bold text-[#8A3A20]">Officer Review Comments</h4>
                  <p className="mt-1 text-[13px] text-[#8A3A20] leading-relaxed italic">&ldquo;{site.reviewComments}&rdquo;</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] text-[#8A8D86] uppercase font-bold">Visit Date</span>
                  <span className="text-[13.5px] text-[#3A4048] font-medium">{formatDate(site.visitDate)}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#8A8D86] uppercase font-bold">GPS Coordinates</span>
                  <span className="text-[13.5px] text-[#3A4048] font-medium">Lat: {site.lat}, Lng: {site.lng}</span>
                </div>
              </div>

              {site.supportingDoc && (
                <div className="border-t border-[#DEDBD1]/60 pt-4">
                  <h4 className="text-[12.5px] font-bold text-[#3A2A12]">Supporting Documents</h4>
                  <div className="mt-2 flex items-center gap-2 rounded-[6px] border border-[#DEDBD1]/60 bg-[#FAF6EB]/20 px-3 py-2 text-[13px] text-[#5B6472] w-fit">
                    <svg className="h-4.5 w-4.5 text-[#BB892C] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="font-medium">{site.supportingDoc}</span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Risk Score preview (only visible if approved) */}
            <div className="md:col-span-1 space-y-5">
              <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
                <h3 className="text-[12.5px] uppercase font-bold text-[#3A2A12] tracking-wider mb-3">Threat & Risk Assessment</h3>
                {site.status === "APPROVED" && site.riskScore !== null ? (
                  <div className="text-center py-4 bg-[#FAF6EB]/40 rounded-[6px] border border-[#DEDBD1]/40">
                    <span className="block text-[10px] text-[#8A8D86] uppercase font-bold">AI Risk Score</span>
                    <span className="block text-[36px] font-serif font-bold text-[#BB892C] mt-1 leading-none">{site.riskScore}%</span>
                    <div className="mt-2.5">
                      <RiskBandBadge band={site.riskBand!} />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-[#8A8D86] text-[12.5px] border border-dashed border-[#DEDBD1]/80 rounded-[6px] bg-[#FAF9F6]">
                    <p className="font-semibold">Pipeline Pending</p>
                    <p className="text-[11px] mt-1 leading-relaxed px-3">Risk scores will automatically run once approved by a Senior Officer.</p>
                  </div>
                )}
              </div>

              {/* Photos Panel */}
              <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
                <h3 className="text-[12.5px] uppercase font-bold text-[#3A2A12] tracking-wider mb-3">Site Photograph</h3>
                {site.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={site.photoUrl}
                    alt={site.name}
                    className="w-full aspect-[4/3] rounded-[6px] border border-[#DEDBD1] object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-full items-center justify-center rounded-[6px] border border-dashed border-[#D4CFC3] text-[11px] text-[#A6A199] text-center px-4">
                    No photograph attached to exploration report
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="mt-8 border-t border-[#DEDBD1]/60 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#8A8D86] gap-2">
            <span>Report generated on: {new Date().toLocaleDateString("en-GB")}</span>
            <span>Department of Archaeology, Colombo, Sri Lanka</span>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    DRAFT: { label: "Draft", bg: "#EFEEEA", text: "#5B6472" },
    SUBMITTED: { label: "Submitted", bg: "#FBF0EB", text: "#9A5A2E" },
    APPROVED: { label: "Approved", bg: "#EAF3EA", text: "#2C6B33" },
    REJECTED: { label: "Rejected", bg: "#FBEBEA", text: "#B03A2E" },
    NEEDS_CORRECTION: { label: "Correction requested", bg: "#FBEBEA", text: "#B03A2E" },
  };
  const item = config[status] || { label: status, bg: "#FAF9F6", text: "#3A2A12" };

  return (
    <span
      className="inline-block rounded-[4px] px-2.5 py-0.5 text-[12.5px] font-semibold border border-black/5"
      style={{ backgroundColor: item.bg, color: item.text }}
    >
      {item.label}
    </span>
  );
}

function RiskBandBadge({ band }: { band: string }) {
  const config: Record<string, string> = {
    VERY_HIGH: "bg-[#F6E0DC] text-[#8A2418] border-[#8A2418]/25",
    HIGH: "bg-[#FBEBEA] text-[#B03A2E] border-[#B03A2E]/25",
    MODERATE: "bg-[#FBF0EB] text-[#9A5A2E] border-[#9A5A2E]/25",
    LOW: "bg-[#EAF3EA] text-[#2C6B33] border-[#2C6B33]/25",
  };

  const bgStyle = config[band] || "bg-[#EFEEEA] text-[#5B6472]";

  return (
    <span className={`inline-block rounded-[4px] px-2.5 py-0.5 text-[11.5px] font-bold border ${bgStyle}`}>
      {band.replace("_", " ")} RISK
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}
