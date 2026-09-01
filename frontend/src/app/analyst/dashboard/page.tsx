"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatCard from "@/src/components/dashboard/StatCard";
import QuickLinkCard from "@/src/components/dashboard/QuickLinkCard";
import ActivityTimeline from "@/src/components/dashboard/ActivityTimeline";
import { getSites, type ExplorationSite } from "@/src/services/siteService";

type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  status: "completed" | "pending" | "alert" | "info";
};

type PreviewMarker = { x: number; y: number };

export default function AnalystDashboardPage() {
  const [sites, setSites] = useState<ExplorationSite[]>([]);

  useEffect(() => {
    setSites(getSites());
  }, []);

  const approvedSites = sites.filter(s => s.status === "APPROVED");
  const pendingSites = sites.filter(s => s.status === "SUBMITTED");
  
  const highRiskCount = approvedSites.filter(
    s => s.riskBand === "HIGH" || s.riskBand === "VERY_HIGH"
  ).length;

  const previewMarkers: PreviewMarker[] = approvedSites.map(s => {
    // Project simple lat/lng to percentage bounds
    const x = ((s.lng - 79.5) / (81.9 - 79.5)) * 100;
    const y = ((9.9 - s.lat) / (9.9 - 5.9)) * 100;
    return { x, y };
  });

  const recentActivities: ActivityItem[] = [
    {
      id: "act1",
      title: "AI Pipeline Executed",
      detail: "Completed automatic risk assessment for newly approved sites. Threat indexes updated.",
      timestamp: "Just now",
      status: "completed",
    },
    {
      id: "act2",
      title: "Analytical Report Generated",
      detail: "Generated report summaries prioritizing high threat zones.",
      timestamp: "Yesterday",
      status: "completed",
    },
    {
      id: "act3",
      title: "New Survey Site Submitted",
      detail: `${pendingSites.length} exploration records awaiting senior officer authorization.`,
      timestamp: "2 days ago",
      status: "pending",
    },
  ];

  return (
    <div className="flex flex-1 flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">
            Analyst dashboard
          </h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            Overview of spatial analysis, threat models, and risk parameters
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
            className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-[#DEDBD1] bg-[#F0E6C8] items-center justify-center transition hover:border-[#BB892C]/40"
          >
            <span className="text-[12px] font-medium text-[#8F6A21] font-semibold">
              KS
            </span>
          </Link>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 py-7 lg:px-9 bg-[#F0E6C8]/30">
        {/* Summary Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Sites Analyzed"
            value={approvedSites.length}
            detail="Approved sites processed by AI"
            colorClass="text-[#3A2A12]"
            icon={<MapPinIcon />}
          />
          <StatCard
            label="High Threat Zones"
            value={highRiskCount}
            detail="High / Very High AI Risk level"
            colorClass="text-[#B03A2E]"
            icon={<AlertIcon />}
          />
          <StatCard
            label="Awaiting Approval"
            value={pendingSites.length}
            detail="Explorations in review queue"
            colorClass="text-[#9A5A2E]"
            icon={<DocIcon />}
          />
          <StatCard
            label="AI Risk Schema"
            value={2}
            detail="Supervised Predictive Models"
            colorClass="text-[#2C6B33]"
            icon={<GearIcon />}
          />
        </section>

        {/* Dashboard Grid */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-3">
          {/* Left Column: Quick Links & Activity */}
          <div className="space-y-5 lg:col-span-2">
            {/* Quick Actions */}
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5 shadow-xs">
              <h2 className="text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
                Quick Actions
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <QuickLinkCard
                  href="/analyst/dashboard/risk-assessment"
                  title="Risk Assessment"
                  description="Configure and run archaeological threat and hazard model variables."
                  icon={<ShieldIcon />}
                  theme="warm"
                />
                <QuickLinkCard
                  href="/analyst/dashboard/gis-map"
                  title="GIS Map View"
                  description="Explore interactive spatial coordinates and threat layer overlays."
                  icon={<MapIcon />}
                  theme="warm"
                />
              </div>
            </div>

            {/* Recent Activity List */}
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5 shadow-xs">
              <h2 className="mb-5 text-[14px] font-semibold text-[#3A2A12] uppercase tracking-wider">
                Recent Analytical Activity
              </h2>
              <ActivityTimeline activities={recentActivities} />
            </div>
          </div>

          {/* Right Column: GIS Preview & Status */}
          <div className="space-y-5 lg:col-span-1">
            {/* Map Preview card */}
            <div className="overflow-hidden rounded-[10px] border border-[#DEDBD1] bg-white shadow-xs">
              <div className="border-b border-[#DEDBD1] bg-[#FAF6EB]/40 px-5 py-3">
                <h2 className="text-[13px] font-medium text-[#3A2A12]">
                  Risk Zone Map Preview
                </h2>
              </div>
              <Link href="/analyst/dashboard/gis-map" className="group block relative">
                <RiskZonePreview markers={previewMarkers} />
                <div className="absolute bottom-3 right-3 rounded-full bg-[#BB892C] px-3 py-1.5 text-[11px] font-medium text-[#F4F2ED] shadow-sm transition hover:bg-[#8F6A21]">
                  View GIS Map &rarr;
                </div>
              </Link>
            </div>

            {/* AI Risk Predictions List */}
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-5 py-5 shadow-xs">
              <h2 className="text-[13px] font-medium text-[#3A2A12] border-b border-[#DEDBD1]/60 pb-2 mb-3">
                AI Site Predictions
              </h2>
              <div className="divide-y divide-[#DEDBD1]/60">
                {approvedSites.length === 0 ? (
                  <p className="py-3 text-[13px] text-[#8A8D86]">No approved predictions.</p>
                ) : (
                  approvedSites.slice(0, 5).map((site) => (
                    <div key={site.id} className="flex items-center justify-between py-2.5">
                      <div>
                        <p className="text-[13px] font-semibold text-[#3A2A12]">{site.name}</p>
                        <p className="text-[11px] text-[#BB892C] font-semibold">{site.riskScore}% ({site.riskBand} risk)</p>
                      </div>
                      <Link
                        href="/analyst/dashboard/gis-map"
                        className="text-[12px] font-medium text-[#BB892C] hover:underline"
                      >
                        Map
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RiskZonePreview({ markers }: { markers: PreviewMarker[] }) {
  const gridLines = [0, 1, 2, 3, 4, 5];

  return (
    <div className="relative aspect-[4/3] w-full bg-[#FAF6EB]">
      {/* Decorative graticule lines */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {gridLines.map((i) => (
          <line
            key={`v${i}`}
            x1={`${(i / (gridLines.length - 1)) * 100}%`}
            y1="0"
            x2={`${(i / (gridLines.length - 1)) * 100}%`}
            y2="100%"
            stroke="#EFE9D6"
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
            stroke="#EFE9D6"
            strokeWidth={1}
          />
        ))}
      </svg>

      {/* Mock risk clusters */}
      {markers.slice(0, 8).map((m, i) => (
        <div
          key={i}
          className="absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B03A2E] ring-4 ring-[#B03A2E]/20 animate-pulse"
          style={{ left: `${m.x}%`, top: `${m.y}%`, animationDelay: `${i * 300}ms` }}
        />
      ))}

      <p className="absolute inset-0 flex items-center justify-center text-[12px] font-medium tracking-wide text-[#8A8478]/80 group-hover:text-[#5B6472]">
        Click to open spatial explorer
      </p>
    </div>
  );
}

/* ---------------- icons ---------------- */

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

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 2 22 22 22" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
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
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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