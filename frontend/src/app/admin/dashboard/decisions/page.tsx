"use client";

import { useState } from "react";

/**
 * Admin decisions — /admin/dashboard/decisions
 *
 * FRONTEND-ONLY: all data below is mocked locally. Once the backend
 * exists, replace the three arrays with a server-side fetch (same
 * pattern as the other dashboard pages) and pass the results down.
 *
 * Use-case mapping (Decision Support module):
 *  - "View decision support dashboard" --<<include>>--> "Prioritize
 *     archaeological sites" --<<include>>--> "View conservation
 *     recommendations" → the three tabs below cover this chain: the
 *     dashboard IS the prioritized list, which each link out to
 *     recommendations for that site.
 *  - "Monitor archaeological site status" → the Monitoring tab.
 *  - "Generate management report" lives on the Reports page, not here,
 *     since it's a separate admin-only action in the diagram.
 */

type RiskLevel = "High" | "Medium" | "Low";
type SiteCondition = "Stable" | "At risk" | "Under conservation";

type PrioritizedSite = {
  id: string;
  name: string;
  region: string;
  riskLevel: RiskLevel;
  priorityScore: number;
};

type Recommendation = {
  id: string;
  site: string;
  recommendation: string;
  urgency: RiskLevel;
};

type MonitoringEntry = {
  id: string;
  site: string;
  condition: SiteCondition;
  lastChecked: string;
};

const PRIORITIZED_SITES: PrioritizedSite[] = [
  { id: "site1", name: "Anuradhapura North", region: "North Central Province", riskLevel: "High", priorityScore: 92 },
  { id: "site2", name: "Sigiriya East Ridge", region: "Central Province", riskLevel: "High", priorityScore: 88 },
  { id: "site3", name: "Polonnaruwa South", region: "North Central Province", riskLevel: "Medium", priorityScore: 61 },
  { id: "site4", name: "Yapahuwa Terrace", region: "North Western Province", riskLevel: "Medium", priorityScore: 54 },
  { id: "site5", name: "Ritigala Grove", region: "North Central Province", riskLevel: "Low", priorityScore: 29 },
];

const RECOMMENDATIONS: Recommendation[] = [
  { id: "rec1", site: "Anuradhapura North", recommendation: "Install erosion barriers along the eastern slope before the monsoon season.", urgency: "High" },
  { id: "rec2", site: "Sigiriya East Ridge", recommendation: "Restrict visitor access to the exposed fresco chamber pending structural review.", urgency: "High" },
  { id: "rec3", site: "Polonnaruwa South", recommendation: "Schedule a vegetation clearance survey within the next quarter.", urgency: "Medium" },
  { id: "rec4", site: "Yapahuwa Terrace", recommendation: "Reassess drainage around the staircase foundation.", urgency: "Medium" },
];

const MONITORING: MonitoringEntry[] = [
  { id: "site1", site: "Anuradhapura North", condition: "At risk", lastChecked: "2026-07-08" },
  { id: "site2", site: "Sigiriya East Ridge", condition: "Under conservation", lastChecked: "2026-07-05" },
  { id: "site3", site: "Polonnaruwa South", condition: "Stable", lastChecked: "2026-06-29" },
  { id: "site4", site: "Yapahuwa Terrace", condition: "Stable", lastChecked: "2026-06-25" },
  { id: "site5", site: "Ritigala Grove", condition: "Stable", lastChecked: "2026-06-18" },
];

const TABS = ["Prioritized sites", "Recommendations", "Monitoring"] as const;
type Tab = (typeof TABS)[number];

export default function AdminDecisionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Prioritized sites");

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">Decisions</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Tabs */}
        <div className="flex gap-1 border-b border-[#DEDBD1]">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={
                "px-4 py-2.5 text-[13px] font-medium transition " +
                (activeTab === tab
                  ? "border-b-2 border-[#16283F] text-[#16283F]"
                  : "text-[#8A8D86] hover:text-[#5B6472]")
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="mt-5">
          {activeTab === "Prioritized sites" && <PrioritizedSitesTable sites={PRIORITIZED_SITES} />}
          {activeTab === "Recommendations" && <RecommendationsList items={RECOMMENDATIONS} />}
          {activeTab === "Monitoring" && <MonitoringTable entries={MONITORING} />}
        </div>
      </main>
    </div>
  );
}

function PrioritizedSitesTable({ sites }: { sites: PrioritizedSite[] }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="bg-[#16283F] text-[12px] text-[#F4F2ED]">
            <th className="px-5 py-3 font-medium">Site name</th>
            <th className="px-5 py-3 font-medium">Region</th>
            <th className="px-5 py-3 font-medium">Risk level</th>
            <th className="px-5 py-3 font-medium">Priority score</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((site, i) => (
            <tr key={site.id} className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}>
              <td className="px-5 py-3 text-[#16283F]">{site.name}</td>
              <td className="px-5 py-3 text-[#3A4048]">{site.region}</td>
              <td className="px-5 py-3">
                <RiskBadge level={site.riskLevel} />
              </td>
              <td className="px-5 py-3 text-[#3A4048]">{site.priorityScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RecommendationsList({ items }: { items: Recommendation[] }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.id} className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[14px] font-medium text-[#16283F]">{item.site}</h3>
            <RiskBadge level={item.urgency} />
          </div>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6472]">
            {item.recommendation}
          </p>
        </div>
      ))}
    </div>
  );
}

function MonitoringTable({ entries }: { entries: MonitoringEntry[] }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="bg-[#16283F] text-[12px] text-[#F4F2ED]">
            <th className="px-5 py-3 font-medium">Site name</th>
            <th className="px-5 py-3 font-medium">Condition</th>
            <th className="px-5 py-3 font-medium">Last checked</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, i) => (
            <tr key={entry.id} className={i % 2 === 1 ? "bg-[#F8F7F4]" : undefined}>
              <td className="px-5 py-3 text-[#16283F]">{entry.site}</td>
              <td className="px-5 py-3">
                <ConditionBadge condition={entry.condition} />
              </td>
              <td className="px-5 py-3 text-[#3A4048]">{entry.lastChecked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RiskBadge({ level }: { level: RiskLevel }) {
  const styles: Record<RiskLevel, string> = {
    High: "bg-[#F6E8E3] text-[#9A4B2E]",
    Medium: "bg-[#FBF3DC] text-[#8A6A1E]",
    Low: "bg-[#EAF1EA] text-[#2F5C3B]",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${styles[level]}`}>
      {level}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: SiteCondition }) {
  const styles: Record<SiteCondition, string> = {
    Stable: "bg-[#EAF1EA] text-[#2F5C3B]",
    "At risk": "bg-[#F6E8E3] text-[#9A4B2E]",
    "Under conservation": "bg-[#F4F3EF] text-[#5B6472]",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${styles[condition]}`}>
      {condition}
    </span>
  );
}