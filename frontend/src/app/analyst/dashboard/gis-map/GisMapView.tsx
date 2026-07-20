"use client";

import { useMemo, useState } from "react";

/**
 * Interactive GIS map view. See the MAP NOTE in page.tsx — this is a
 * dependency-free grid scaled to Sri Lanka's onshore bounding box, not a
 * real tiled map. Everything here operates on plain { lat, lng } values,
 * so swapping in react-leaflet/mapbox-gl later only touches this file.
 */

const SL_BOUNDS = { latMin: 5.9, latMax: 9.9, lngMin: 79.5, lngMax: 81.9 };

export type SiteStatus = "active" | "monitoring" | "at_risk" | "archived";
export type RiskLevel = "low" | "medium" | "high" | "critical";

export type MapSite = {
  id: string;
  name: string;
  district: string;
  siteType: string;
  historicalPeriod: string;
  status: SiteStatus;
  riskLevel: RiskLevel | null;
  lat: number;
  lng: number;
  photoUrl: string | null;
};

type Layers = {
  explorationSites: boolean;
  riskZones: boolean;
  siteDensity: boolean;
  boundaries: boolean;
};

const STATUS_OPTIONS: { value: SiteStatus | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "monitoring", label: "Monitoring" },
  { value: "at_risk", label: "At risk" },
  { value: "archived", label: "Archived" },
];

const STATUS_COLORS: Record<SiteStatus, string> = {
  active: "#2C6B33",
  monitoring: "#9A5A2E",
  at_risk: "#B03A2E",
  archived: "#8A8D86",
};

const RISK_COLORS: Record<RiskLevel, string> = {
  low: "#B8892B",
  medium: "#C97A3A",
  high: "#B0472E",
  critical: "#8A2418",
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;

export default function GisMapView({ sites, isFieldOfficer = false }: { sites: MapSite[]; isFieldOfficer?: boolean }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<SiteStatus | "all">("all");
  const [layers, setLayers] = useState<Layers>({
    explorationSites: true,
    riskZones: false,
    siteDensity: false,
    boundaries: false,
  });
  const [zoom, setZoom] = useState(1);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  const filteredSites = useMemo(() => {
    return sites.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (query.trim() && !s.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [sites, statusFilter, query]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) ?? null;

  function toggleLayer(key: keyof Layers) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      {/* Map */}
      <div className="relative overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
        <div className="border-b border-[#DEDBD1] px-4 py-3">
          <input
            type="search"
            placeholder="Search exploration sites…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full max-w-[320px] rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2 text-[13px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          />
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FAF6EB]">
          <div
            className="absolute inset-0 origin-center transition-transform duration-200"
            style={{ transform: `scale(${zoom})` }}
          >
            <MapCanvas
              sites={filteredSites}
              layers={layers}
              selectedSiteId={selectedSiteId}
              onSelect={setSelectedSiteId}
            />
          </div>

          {/* Zoom controls */}
          <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-[6px] border border-[#DEDBD1] bg-white shadow-[0_1px_2px_rgba(20,25,33,0.08)]">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, z + ZOOM_STEP))}
              disabled={zoom >= ZOOM_MAX}
              aria-label="Zoom in"
              className="flex h-8 w-8 items-center justify-center text-[#3A4048] transition hover:bg-[#FAF6EB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <PlusIcon />
            </button>
            <div className="h-px bg-[#DEDBD1]" />
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, z - ZOOM_STEP))}
              disabled={zoom <= ZOOM_MIN}
              aria-label="Zoom out"
              className="flex h-8 w-8 items-center justify-center text-[#3A4048] transition hover:bg-[#FAF6EB] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <MinusIcon />
            </button>
          </div>

          {zoom !== 1 && (
            <button
              type="button"
              onClick={() => setZoom(1)}
              className="absolute right-3 top-[92px] rounded-[6px] border border-[#DEDBD1] bg-white px-2 py-1 text-[11px] font-medium text-[#5B6472] shadow-[0_1px_2px_rgba(20,25,33,0.08)] hover:text-[#BB892C]"
            >
              Reset
            </button>
          )}

          {/* Map Legend Overlay */}
          <div className="absolute right-3 bottom-3 rounded-[6px] border border-[#DEDBD1] bg-white/95 p-3 text-[11px] shadow-[0_1px_2px_rgba(20,25,33,0.08)] max-w-[200px] z-10 backdrop-blur-xs">
            <span className="block font-bold text-[#3A2A12] uppercase tracking-wider mb-2">
              Map Legend
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#2C6B33]" />
                <span className="text-[#5B6472]">Active Exploration</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#9A5A2E]" />
                <span className="text-[#5B6472]">Monitoring Area</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B03A2E]" />
                <span className="text-[#5B6472]">High Risk / Threatened</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#8A8D86]" />
                <span className="text-[#5B6472]">Archived Record</span>
              </div>
            </div>

            <div className="mt-3 border-t border-[#DEDBD1] pt-2">
              <span className="block font-semibold text-[#8A8478] mb-1">Data Provenance:</span>
              <ul className="list-disc pl-3.5 text-[9.5px] text-[#8A8D86] space-y-0.5">
                <li>Coordinates: Archaeology Dept SL</li>
                <li>Boundaries: Survey Dept SL</li>
                <li>Flooding Hazard: DMC Disaster Centre</li>
              </ul>
            </div>
          </div>

          {/* Site detail card */}
          {selectedSite && (
            <SiteDetailCard site={selectedSite} onClose={() => setSelectedSiteId(null)} />
          )}
        </div>
      </div>

      {/* Layers & filters */}
      <div className="space-y-4">
        {!isFieldOfficer && (
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4">
            <h2 className="text-[13px] font-medium text-[#3A2A12]">Layers</h2>
            <div className="mt-2.5 space-y-2">
              <LayerCheckbox
                label="Exploration sites"
                checked={layers.explorationSites}
                onChange={() => toggleLayer("explorationSites")}
              />
              <LayerCheckbox
                label="Risk zones"
                checked={layers.riskZones}
                onChange={() => toggleLayer("riskZones")}
              />
              <LayerCheckbox
                label="Site density"
                checked={layers.siteDensity}
                onChange={() => toggleLayer("siteDensity")}
              />
              <LayerCheckbox
                label="Boundaries"
                checked={layers.boundaries}
                onChange={() => toggleLayer("boundaries")}
              />
            </div>
          </div>
        )}

        <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4">
          <h2 className="text-[13px] font-medium text-[#3A2A12]">Filter by status</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SiteStatus | "all")}
            className="mt-2.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <p className="px-1 text-[12px] text-[#8A8D86]">
          {filteredSites.length} of {sites.length} sites shown
        </p>
      </div>
    </div>
  );
}

function MapCanvas({
  sites,
  layers,
  selectedSiteId,
  onSelect,
}: {
  sites: MapSite[];
  layers: Layers;
  selectedSiteId: string | null;
  onSelect: (id: string) => void;
}) {
  const gridLines = [0, 1, 2, 3, 4, 5];

  function project(lat: number, lng: number) {
    return {
      xPct: ((lng - SL_BOUNDS.lngMin) / (SL_BOUNDS.lngMax - SL_BOUNDS.lngMin)) * 100,
      yPct: ((SL_BOUNDS.latMax - lat) / (SL_BOUNDS.latMax - SL_BOUNDS.latMin)) * 100,
    };
  }

  // Rough density: how many other sites fall within a small lat/lng radius.
  function densityFor(site: MapSite) {
    const radius = 0.4;
    return sites.filter(
      (o) => Math.hypot(o.lat - site.lat, o.lng - site.lng) < radius
    ).length;
  }

  return (
    <div className="absolute inset-0">
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {gridLines.map((i) => (
          <line
            key={`v${i}`}
            x1={`${(i / (gridLines.length - 1)) * 100}%`}
            y1="0"
            x2={`${(i / (gridLines.length - 1)) * 100}%`}
            y2="100%"
            stroke="#DEDBD1"
            strokeWidth={1}
          />
        ))}
        {gridLines.map((i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${(i / (gridLines.length - 1)) * 100}%`}
            x2="100%"
            y2={`${(i / (gridLines.length - 1)) * 100}%`}
            stroke="#DEDBD1"
            strokeWidth={1}
          />
        ))}
      </svg>

      {layers.boundaries && (
        <div className="absolute inset-3 rounded-[4px] border border-dashed border-[#9AA7B6]" />
      )}

      {layers.siteDensity &&
        sites.map((s) => {
          const { xPct, yPct } = project(s.lat, s.lng);
          const density = densityFor(s);
          if (density < 2) return null;
          return (
            <div
              key={`density-${s.id}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3A2A12] opacity-[0.08]"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                width: `${18 + density * 6}px`,
                height: `${18 + density * 6}px`,
              }}
            />
          );
        })}

      {layers.riskZones &&
        sites
          .filter((s) => s.riskLevel === "high" || s.riskLevel === "critical")
          .map((s) => {
            const { xPct, yPct } = project(s.lat, s.lng);
            return (
              <div
                key={`risk-${s.id}`}
                className="absolute h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
                style={{
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  backgroundColor: RISK_COLORS[s.riskLevel!],
                }}
              />
            );
          })}

      {layers.explorationSites &&
        sites.map((s) => {
          const { xPct, yPct } = project(s.lat, s.lng);
          const isSelected = s.id === selectedSiteId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-label={`View details for ${s.name}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white transition"
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                width: isSelected ? 14 : 10,
                height: isSelected ? 14 : 10,
                backgroundColor: STATUS_COLORS[s.status],
                boxShadow: isSelected ? "0 0 0 3px rgba(187,137,44,0.25)" : undefined,
              }}
            />
          );
        })}
    </div>
  );
}

function SiteDetailCard({ site, onClose }: { site: MapSite; onClose: () => void }) {
  return (
    <div className="absolute bottom-3 left-3 w-[260px] rounded-[8px] border border-[#DEDBD1] bg-white p-4 shadow-[0_2px_8px_rgba(20,25,33,0.12)]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[14px] font-medium text-[#3A2A12]">{site.name}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close site details"
          className="text-[#8A8D86] hover:text-[#5B6472]"
        >
          <CloseIcon />
        </button>
      </div>

      {site.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={site.photoUrl}
          alt={`Photograph of ${site.name}`}
          className="mt-2.5 h-28 w-full rounded-[6px] border border-[#DEDBD1] object-cover"
        />
      ) : (
        <div className="mt-2.5 flex h-20 w-full items-center justify-center rounded-[6px] border border-dashed border-[#D4CFC3] text-[11px] text-[#A6A199]">
          No photograph uploaded
        </div>
      )}

      <dl className="mt-3 space-y-1 text-[12px] text-[#5B6472]">
        <div className="flex justify-between gap-2">
          <dt>District</dt>
          <dd className="text-[#23262B]">{site.district}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Type</dt>
          <dd className="text-[#23262B]">{site.siteType}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Period</dt>
          <dd className="text-[#23262B]">{site.historicalPeriod}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt>Status</dt>
          <dd style={{ color: STATUS_COLORS[site.status] }} className="font-medium capitalize">
            {site.status.replace("_", " ")}
          </dd>
        </div>
        {site.riskLevel && (
          <div className="flex justify-between gap-2">
            <dt>Risk level</dt>
            <dd style={{ color: RISK_COLORS[site.riskLevel] }} className="font-medium capitalize">
              {site.riskLevel}
            </dd>
          </div>
        )}
      </dl>
    </div>
  );
}

function LayerCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#3A4048]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
      />
      {label}
    </label>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MinusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}