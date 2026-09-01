"use client";

import { useMemo, useState, useEffect } from "react";
import { getSites, type ExplorationSite, type RiskBand } from "@/src/services/siteService";

const SL_BOUNDS = { latMin: 5.9, latMax: 9.9, lngMin: 79.5, lngMax: 81.9 };

type Layers = {
  explorationSites: boolean;
  riskZones: boolean;
  boundaries: boolean;
};

const RISK_COLORS: Record<RiskBand, string> = {
  VERY_HIGH: "#B03A2E", // Red
  HIGH: "#9A5A2E",      // Orange
  MODERATE: "#BB892C",  // Yellow
  LOW: "#2C6B33",       // Green
};

const ZOOM_MIN = 1;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.5;

export default function GisMapView({ isFieldOfficer = false }: { sites?: any[]; isFieldOfficer?: boolean }) {
  const [sitesList, setSitesList] = useState<ExplorationSite[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [layers, setLayers] = useState<Layers>({
    explorationSites: true,
    riskZones: true,
    boundaries: false,
  });
  const [zoom, setZoom] = useState(1);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);

  useEffect(() => {
    setSitesList(getSites());
  }, []);

  const filteredSites = useMemo(() => {
    return sitesList.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (query.trim() && !s.name.toLowerCase().includes(query.trim().toLowerCase())) return false;
      return true;
    });
  }, [sitesList, statusFilter, query]);

  const selectedSite = sitesList.find((s) => s.id === selectedSiteId) ?? null;

  function toggleLayer(key: keyof Layers) {
    setLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
      {/* Map */}
      <div className="relative overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white shadow-xs">
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
          <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-[6px] border border-[#DEDBD1] bg-white shadow-sm z-10">
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
              className="absolute right-3 top-[92px] rounded-[6px] border border-[#DEDBD1] bg-white px-2 py-1 text-[11px] font-medium text-[#5B6472] shadow-sm hover:text-[#BB892C] z-10"
            >
              Reset
            </button>
          )}

          {/* Map Legend Overlay */}
          <div className="absolute right-3 bottom-3 rounded-[6px] border border-[#DEDBD1] bg-white/95 p-3 text-[11px] shadow-sm max-w-[200px] z-10 backdrop-blur-xs">
            <span className="block font-bold text-[#3A2A12] uppercase tracking-wider mb-2">
              Threat Map Legend
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#B03A2E]" />
                <span className="text-[#5B6472]">Very High Risk (76-100%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#9A5A2E]" />
                <span className="text-[#5B6472]">High Risk (51-75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#BB892C]" />
                <span className="text-[#5B6472]">Moderate Risk (26-50%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#2C6B33]" />
                <span className="text-[#5B6472]">Low Risk (0-25%)</span>
              </div>
              <div className="flex items-center gap-1.5 border-t border-[#DEDBD1] pt-1.5 mt-1.5">
                <span className="h-2 w-2 rounded-full border border-dashed border-[#A6A199] bg-[#EFEEEA]" />
                <span className="text-[#8A8D86]">Pending review (neutral)</span>
              </div>
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
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4 shadow-xs">
            <h2 className="text-[13px] font-medium text-[#3A2A12] uppercase tracking-wider border-b border-[#DEDBD1]/60 pb-2 mb-3">Layers</h2>
            <div className="mt-2.5 space-y-2">
              <LayerCheckbox
                label="Show Site Markers"
                checked={layers.explorationSites}
                onChange={() => toggleLayer("explorationSites")}
              />
              <LayerCheckbox
                label="Risk Threat Zones"
                checked={layers.riskZones}
                onChange={() => toggleLayer("riskZones")}
              />
              <LayerCheckbox
                label="Survey Boundaries"
                checked={layers.boundaries}
                onChange={() => toggleLayer("boundaries")}
              />
            </div>
          </div>
        )}

        <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4 shadow-xs">
          <h2 className="text-[13px] font-medium text-[#3A2A12] uppercase tracking-wider border-b border-[#DEDBD1]/60 pb-2 mb-3">Filter by status</h2>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="mt-2.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C]/40"
          >
            <option value="all">All statuses</option>
            <option value="APPROVED">Approved (AI Risk Predicted)</option>
            <option value="SUBMITTED">Submitted (Pending Review)</option>
            <option value="NEEDS_CORRECTION">Correction Requested</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <p className="px-1 text-[12px] text-[#8A8D86]">
          {filteredSites.length} of {sitesList.length} sites shown
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
  sites: ExplorationSite[];
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
            strokeDasharray="2,2"
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
            strokeDasharray="2,2"
          />
        ))}
      </svg>

      {layers.boundaries && (
        <div className="absolute inset-3 rounded-[4px] border border-dashed border-[#9AA7B6] opacity-60" />
      )}

      {/* AI Risk Threat Zone rings (Large colored halos) */}
      {layers.riskZones &&
        sites
          .filter((s) => s.status === "APPROVED" && s.riskScore !== null)
          .map((s) => {
            const { xPct, yPct } = project(s.lat, s.lng);
            const color = RISK_COLORS[s.riskBand!];
            return (
              <div
                key={`risk-${s.id}`}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 border border-black/5 animate-pulse"
                style={{
                  left: `${xPct}%`,
                  top: `${yPct}%`,
                  width: "56px",
                  height: "56px",
                  backgroundColor: color,
                }}
              />
            );
          })}

      {/* Main markers */}
      {layers.explorationSites &&
        sites.map((s) => {
          const { xPct, yPct } = project(s.lat, s.lng);
          const isSelected = s.id === selectedSiteId;
          const isApproved = s.status === "APPROVED";
          
          const markerColor = isApproved && s.riskBand ? RISK_COLORS[s.riskBand] : "#A6A199";

          return (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              aria-label={`View details for ${s.name}`}
              className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                isApproved ? "border-white" : "border-dashed border-[#8A8D86]/80"
              } shadow-md transition-all hover:scale-125`}
              style={{
                left: `${xPct}%`,
                top: `${yPct}%`,
                width: isSelected ? 15 : 11,
                height: isSelected ? 15 : 11,
                backgroundColor: markerColor,
                boxShadow: isSelected ? `0 0 0 4px ${markerColor}33` : undefined,
              }}
            />
          );
        })}
    </div>
  );
}

function SiteDetailCard({ site, onClose }: { site: ExplorationSite; onClose: () => void }) {
  const isApproved = site.status === "APPROVED";

  return (
    <div className="absolute bottom-3 left-3 w-[275px] rounded-[8px] border border-[#DEDBD1] bg-white p-4.5 shadow-lg z-10">
      <div className="flex items-start justify-between gap-2 border-b border-[#DEDBD1]/60 pb-2 mb-2.5">
        <div>
          <p className="text-[13.5px] font-bold text-[#3A2A12] leading-tight">{site.name}</p>
          <span className="text-[10px] text-[#8A8D86] uppercase font-semibold">{site.district} District</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close site details"
          className="text-[#8A8D86] hover:text-[#3A2A12] text-[18px] leading-none"
        >
          &times;
        </button>
      </div>

      <dl className="space-y-1.5 text-[11.5px] text-[#5B6472]">
        <div className="flex justify-between gap-2">
          <dt>Record Status</dt>
          <dd className="font-semibold capitalize" style={{ color: isApproved ? "#2C6B33" : "#9A5A2E" }}>
            {site.status.replace("_", " ")}
          </dd>
        </div>

        {isApproved && site.riskScore !== null ? (
          <>
            <div className="flex justify-between gap-2">
              <dt className="font-medium">AI Predicted Risk</dt>
              <dd className="font-bold text-[#BB892C]">{site.riskScore}%</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="font-medium">Vulnerability Band</dt>
              <dd className="font-bold uppercase" style={{ color: RISK_COLORS[site.riskBand!] }}>
                {site.riskBand}
              </dd>
            </div>
            
            <div className="border-t border-[#DEDBD1]/60 my-2 pt-2 text-[10.5px]">
              <span className="block font-bold text-[#3A2A12] uppercase mb-1">Risk Factors:</span>
              <ul className="list-disc pl-3.5 space-y-0.5 text-[#5B6472]">
                <li>Terrain: {site.elevation}m</li>
                <li>Rainfall: {site.rainfall}</li>
                <li>Water margins: {site.distanceToRiver}</li>
                <li>Development: {site.proximityDevelopment}</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="bg-[#FAF6EB]/40 p-2.5 rounded border border-[#DEDBD1]/60 mt-2 text-[11px] leading-relaxed text-[#8A8478] italic">
            This site is pending authorization. Prediction metrics run automatically on approval.
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
    <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-[#3A4048]">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
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