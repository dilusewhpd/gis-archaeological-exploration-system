"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import {
  apiErrorMessage,
  listMySites,
  listSites,
  SITE_STATUS_LABELS,
  STATUS_COLOR,
  type SiteListItem,
  type SiteStatus,
} from "@/lib/sites";

/**
 * GIS map backed by real OpenStreetMap tiles (react-leaflet). Sites come
 * from the central backend: field officers see only their own
 * (GET /api/sites/my-sites), every other role sees all (GET /api/sites).
 * The Leaflet layer is loaded client-side only (it needs `window`), so it's
 * dynamically imported with ssr disabled — see LeafletMap.tsx.
 */

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center bg-[#FAF6EB] text-[13px] text-[#8A8478]">
      Loading map…
    </div>
  ),
});

type Role = "field_officer" | "senior_officer" | "analyst" | "admin";

const STATUS_OPTIONS: (SiteStatus | "all")[] = [
  "all",
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
];

function detailHref(role: Role, id: string): string | null {
  if (role === "field_officer") return `/field_officer/dashboard/records/${id}`;
  if (role === "senior_officer") return `/senior_officer/dashboard/records/${id}`;
  return null; // analyst / admin have no site detail route yet
}

function hasValidCoords(s: SiteListItem): boolean {
  const lat = Number(s.latitude);
  const lng = Number(s.longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && (lat !== 0 || lng !== 0);
}

export default function GisMapView({ role = "analyst" }: { role?: Role }) {
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SiteStatus | "all">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = role === "field_officer" ? await listMySites() : await listSites();
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
  }, [role]);

  const mappable = useMemo(() => sites.filter(hasValidCoords), [sites]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mappable.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (q && !s.name.toLowerCase().includes(q) && !s.siteCode.toLowerCase().includes(q))
        return false;
      return true;
    });
  }, [mappable, statusFilter, query]);

  const withoutCoords = sites.length - mappable.length;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      {/* Map */}
      <div className="relative overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white shadow-xs">
        <div className="border-b border-[#DEDBD1] px-4 py-3">
          <input
            type="search"
            placeholder="Search sites by name or code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-[320px] rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2 text-[13px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          />
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF6EB]">
          <LeafletMap
            sites={filtered}
            selectedId={selectedId}
            onSelect={setSelectedId}
            detailHref={(id) => detailHref(role, id)}
          />

          {/* Legend */}
          <div className="pointer-events-none absolute bottom-3 right-3 z-[1000] max-w-[190px] rounded-[6px] border border-[#DEDBD1] bg-white/95 p-3 text-[11px] shadow-sm backdrop-blur-xs">
            <span className="mb-2 block font-bold uppercase tracking-wider text-[#3A2A12]">
              Status
            </span>
            <div className="space-y-1.5">
              {(["DRAFT", "PENDING", "APPROVED", "REJECTED"] as SiteStatus[]).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: STATUS_COLOR[s] }}
                  />
                  <span className="text-[#5B6472]">{SITE_STATUS_LABELS[s]}</span>
                </div>
              ))}
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#FAF6EB]/70 text-[13px] text-[#8A8478]">
              Loading sites…
            </div>
          )}

          {!isLoading && error && (
            <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-[#FAF6EB]/80 px-6 text-center text-[13px] text-[#8A3A20]">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4 shadow-xs">
          <h2 className="mb-3 border-b border-[#DEDBD1]/60 pb-2 text-[13px] font-medium uppercase tracking-wider text-[#3A2A12]">
            Filter by status
          </h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SiteStatus | "all")}
            className="w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C]/40"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : SITE_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        <p className="px-1 text-[12px] text-[#8A8D86]">
          {isLoading
            ? "Loading…"
            : `${filtered.length} of ${mappable.length} mapped sites shown`}
          {withoutCoords > 0 && !isLoading && (
            <span className="mt-1 block text-[11px] text-[#A6A199]">
              {withoutCoords} site{withoutCoords === 1 ? "" : "s"} hidden (no coordinates)
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
