"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";

type RiskLevel = "High" | "Medium" | "Low";
type SiteCondition = "Stable" | "At risk" | "Under conservation" | "Archived";

type PrioritizedSite = {
  id: string;
  name: string;
  region: string;
  riskLevel: RiskLevel;
  priorityScore: number;
  algorithmUsed?: string;
  features?: string[];
  clusterName?: string;
  recommendation?: string;
  condition?: string;
  lastChecked?: string;
  lat?: number;
  lng?: number;
  baseRiskWeight?: number;
  hazardScore?: number;
  significanceWeight?: number;
  aiPrediction?: {
    riskLevel: string;
    confidence: number;
    modelVersion: string;
    featureImportance: { feature: string; weight: number }[];
  };
};

// Fallback default prioritization list with recomputed scores and mocked AI Risk prediction classifiers
const DEFAULT_PRIORITIZED_SITES: PrioritizedSite[] = [
  { 
    id: "s1", 
    name: "Anuradhapura North Ruins", 
    region: "North Central Province", 
    riskLevel: "High", 
    priorityScore: 90, 
    algorithmUsed: "K-Means", 
    features: ["coordinates", "elevation", "flood zone", "erosion index", "urban encroachment"], 
    clusterName: "Zone A", 
    recommendation: "Construct dynamic flood defense barriers and restrict construction within 500m.", 
    condition: "At risk", 
    lastChecked: "2026-07-08", 
    lat: 8.450, 
    lng: 80.420, 
    baseRiskWeight: 45, 
    hazardScore: 18, 
    significanceWeight: 27,
    aiPrediction: {
      riskLevel: "Critical",
      confidence: 90,
      modelVersion: "synthetic-v1",
      featureImportance: [
        { feature: "Flood Vulnerability", weight: 35 },
        { feature: "Looting Risk", weight: 25 },
        { feature: "Elevation", weight: 15 },
        { feature: "Urban Encroachment", weight: 15 },
        { feature: "Soil Erosion", weight: 10 }
      ]
    }
  },
  { 
    id: "s2", 
    name: "Sigiriya East Ridge Walls", 
    region: "Central Province", 
    riskLevel: "High", 
    priorityScore: 81, 
    algorithmUsed: "K-Means", 
    features: ["coordinates", "erosion index", "urban encroachment"], 
    clusterName: "Zone A", 
    recommendation: "Enforce rigid buffer boundary zones and deploy weekly security surveillance.", 
    condition: "Under conservation", 
    lastChecked: "2026-07-05", 
    lat: 7.960, 
    lng: 80.770, 
    baseRiskWeight: 45, 
    hazardScore: 6, 
    significanceWeight: 30,
    aiPrediction: {
      riskLevel: "High",
      confidence: 76,
      modelVersion: "synthetic-v1",
      featureImportance: [
        { feature: "Urban Encroachment", weight: 45 },
        { feature: "Soil Erosion", weight: 35 },
        { feature: "Elevation", weight: 10 },
        { feature: "Flood Vulnerability", weight: 10 }
      ]
    }
  },
  { 
    id: "s3", 
    name: "Polonnaruwa South Vihara", 
    region: "North Central Province", 
    riskLevel: "Medium", 
    priorityScore: 69, 
    algorithmUsed: "K-Means", 
    features: ["coordinates", "elevation", "flood zone", "erosion index", "urban encroachment", "looting history"], 
    clusterName: "Zone B", 
    recommendation: "Schedule a vegetation clearance survey within the next quarter.", 
    condition: "Stable", 
    lastChecked: "2026-06-29", 
    lat: 7.940, 
    lng: 81.000, 
    baseRiskWeight: 30, 
    hazardScore: 15, 
    significanceWeight: 24,
    aiPrediction: {
      riskLevel: "High",
      confidence: 82,
      modelVersion: "synthetic-v1",
      featureImportance: [
        { feature: "Flood Vulnerability", weight: 30 },
        { feature: "Looting Risk", weight: 25 },
        { feature: "Elevation", weight: 20 },
        { feature: "Soil Erosion", weight: 15 },
        { feature: "Urban Encroachment", weight: 10 }
      ]
    }
  },
  { 
    id: "s4", 
    name: "Yapahuwa Fortress Steps", 
    region: "North Western Province", 
    riskLevel: "Medium", 
    priorityScore: 54, 
    algorithmUsed: "K-Means", 
    features: ["flood zone", "erosion index"], 
    clusterName: "Zone B", 
    recommendation: "Reassess drainage around the staircase foundation.", 
    condition: "Stable", 
    lastChecked: "2026-06-25", 
    lat: 7.830, 
    lng: 80.320, 
    baseRiskWeight: 30, 
    hazardScore: 3, 
    significanceWeight: 21,
    aiPrediction: {
      riskLevel: "Medium",
      confidence: 68,
      modelVersion: "synthetic-v1",
      featureImportance: [
        { feature: "Flood Vulnerability", weight: 50 },
        { feature: "Soil Erosion", weight: 30 },
        { feature: "Elevation", weight: 10 },
        { feature: "Urban Encroachment", weight: 10 }
      ]
    }
  },
  { 
    id: "s5", 
    name: "Ritigala Hermitage Grove", 
    region: "North Central Province", 
    riskLevel: "Low", 
    priorityScore: 42, 
    algorithmUsed: "K-Means", 
    features: ["coordinates"], 
    clusterName: "Zone C", 
    recommendation: "Maintain routine vegetation clearing and standard public access regulations.", 
    condition: "Stable", 
    lastChecked: "2026-06-18", 
    lat: 8.100, 
    lng: 80.650, 
    baseRiskWeight: 15, 
    hazardScore: 0, 
    significanceWeight: 27,
    aiPrediction: {
      riskLevel: "Low",
      confidence: 60,
      modelVersion: "synthetic-v1",
      featureImportance: [
        { feature: "Elevation", weight: 40 },
        { feature: "Flood Vulnerability", weight: 20 },
        { feature: "Soil Erosion", weight: 20 },
        { feature: "Urban Encroachment", weight: 20 }
      ]
    }
  },
];

const TABS = ["Prioritized sites", "Recommendations", "Monitoring"] as const;
type Tab = (typeof TABS)[number];

export default function AdminDecisionsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Prioritized sites");
  const [sites, setSites] = useState<PrioritizedSite[]>([]);
  const [modelMeta, setModelMeta] = useState<{ algorithm: string; features: string[]; runDate: string; datasetName: string } | null>(null);
  
  // Expandable formula panel state
  const [showFormula, setShowFormula] = useState(false);

  // Search/Filters/Sorting State
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [sortBy, setSortBy] = useState<"priorityScore" | "name">("priorityScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Selected Detail Modal Row State
  const [selectedSite, setSelectedSite] = useState<PrioritizedSite | null>(null);

  useEffect(() => {
    // Read dynamic list of sites from Analyst's modeling run output
    const localData = localStorage.getItem("archaeology_prioritized_sites");
    const localMeta = localStorage.getItem("latest_model_run_meta");

    if (localData) {
      setSites(JSON.parse(localData));
    } else {
      setSites(DEFAULT_PRIORITIZED_SITES);
    }

    if (localMeta) {
      setModelMeta(JSON.parse(localMeta));
    }
  }, []);

  // Compute unique regions for filter select dropdown
  const regions = useMemo(() => {
    return Array.from(new Set(sites.map((s) => s.region)));
  }, [sites]);

  // Apply search/filters/sorting to active data
  const processedSites = useMemo(() => {
    let result = [...sites];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q));
    }

    // Region filter
    if (regionFilter) {
      result = result.filter((s) => s.region === regionFilter);
    }

    // Risk level filter
    if (riskFilter) {
      result = result.filter((s) => s.riskLevel === riskFilter);
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "priorityScore") {
        return sortOrder === "desc" ? b.priorityScore - a.priorityScore : a.priorityScore - b.priorityScore;
      } else {
        return sortOrder === "desc" ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name);
      }
    });

    return result;
  }, [sites, search, regionFilter, riskFilter, sortBy, sortOrder]);

  // Handle local archiving logic
  function handleArchiveSite(id: string) {
    if (confirm("Are you sure you want to archive this exploration record? This moves the record to archived history status.")) {
      setSites((prev) =>
        prev.map((s) => (s.id === id ? { ...s, condition: "Archived" } : s))
      );
      // Persist to localStorage
      const updated = sites.map((s) => (s.id === id ? { ...s, condition: "Archived" } : s));
      localStorage.setItem("archaeology_prioritized_sites", JSON.stringify(updated));
    }
  }

  return (
    <div className="flex flex-1 flex-col relative">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div>
          <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Decisions</h1>
          <p className="mt-0.5 text-[12px] text-[#8A8478]">
            Decision Support validation, site prioritization, and conservation recommendations.
          </p>
        </div>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        {/* Model Metadata Status alert banner */}
        {modelMeta ? (
          <div className="mb-5 rounded-[8px] border border-[#BB892C]/30 bg-[#FAF6EB] px-4 py-3 text-[12.5px] text-[#8F6A21]">
            <span className="font-bold">Active Data Pipeline Sync (Demo Mode — localStorage):</span> Priority list synchronized with Analyst&apos;s latest modeling run (Algorithm: <span className="font-bold">{modelMeta.algorithm}</span>, Run on: <span className="font-bold">{modelMeta.runDate}</span>, Dataset: <span className="font-bold">{modelMeta.datasetName}</span>).
          </div>
        ) : (
          <div className="mb-5 rounded-[8px] border border-[#DEDBD1] bg-white px-4 py-3 text-[12.5px] text-[#8A8D86]">
            Showing default historical exploration data. Log in to the GIS Analyst panel to run fresh K-Means/DBSCAN modeling calculations and update this validation feed.
          </div>
        )}

        {/* Priority Score formula panel */}
        <div className="mb-6 rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4">
          <div className="flex items-center justify-between cursor-pointer" onClick={() => setShowFormula(!showFormula)}>
            <h2 className="text-[12px] font-semibold text-[#3A2A12] uppercase tracking-wider">
              Decision Priority Logic Formula {showFormula ? "▼" : "▶"}
            </h2>
            <span className="text-[11px] text-[#BB892C] font-semibold">
              {showFormula ? "Collapse detail" : "Expand formula logic"}
            </span>
          </div>
          
          {showFormula && (
            <div className="mt-3.5 border-t border-[#DEDBD1]/60 pt-3">
              <p className="text-[13px] text-[#5B6472]">
                Priority score is calculated using the proportional-caps logic summing to 100 points:
                <br />
                <span className="font-serif font-bold text-[#BB892C]">Priority Score = S_risk (Base Risk) + H_hazard (Indicator Weight) + S_sig (Significance Rank)</span>
              </p>
              <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
                <div className="rounded-[6px] bg-[#FAF6EB] p-3 border border-[#DEDBD1]/60">
                  <span className="font-bold text-[#BB892C]">1. Base Risk (Max 50)</span>
                  <p className="mt-1 text-[#8A8478]">Critical (50 pts), High (45 pts), Medium (30 pts), Low (15 pts) base cluster scores.</p>
                </div>
                <div className="rounded-[6px] bg-[#FAF6EB] p-3 border border-[#DEDBD1]/60">
                  <span className="font-bold text-[#BB892C]">2. Hazard Score (Max 20)</span>
                  <p className="mt-1 text-[#8A8478]">Active features triggered relative to a global maximum index (HAZARD_MAX = 75).</p>
                </div>
                <div className="rounded-[6px] bg-[#FAF6EB] p-3 border border-[#DEDBD1]/60">
                  <span className="font-bold text-[#BB892C]">3. Heritage Importance (Max 30)</span>
                  <p className="mt-1 text-[#8A8478]">Sri Lanka Archaeology Department significance rank scaling from 1 to 10 &times; 3.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search, Filter, Sort Controls */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#DEDBD1] bg-white p-4">
          <div className="flex flex-1 min-w-[200px] max-w-sm">
            <input
              type="text"
              placeholder="Search site name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-[6px] border border-[#D4CFC3] px-3 py-1.5 text-[13px] outline-none focus:border-[#BB892C] focus:ring-1 focus:ring-[#BB892C]/10"
            />
          </div>

          <div className="flex flex-wrap gap-2.5 items-center">
            {/* Filter by Region */}
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              className="rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-1.5 text-[13px] text-[#3A4048] outline-none"
            >
              <option value="">All Regions</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>{reg}</option>
              ))}
            </select>

            {/* Filter by Risk Level */}
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-1.5 text-[13px] text-[#3A4048] outline-none"
            >
              <option value="">All Risks</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            {/* Sort Criteria */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "priorityScore" | "name")}
              className="rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-1.5 text-[13px] text-[#3A4048] outline-none"
            >
              <option value="priorityScore">Sort by Priority</option>
              <option value="name">Sort by Name</option>
            </select>

            {/* Sort Order Toggler */}
            <button
              type="button"
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              className="rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-1.5 text-[13px] hover:bg-[#FAF6EB] transition text-[#3A4048]"
            >
              {sortOrder === "asc" ? "Asc ⬆" : "Desc ⬇"}
            </button>
          </div>
        </div>

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
                  ? "border-b-2 border-[#BB892C] text-[#BB892C]"
                  : "text-[#8A8D86] hover:text-[#5B6472]")
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab view rendering */}
        <div className="mt-5">
          {activeTab === "Prioritized sites" && (
            <PrioritizedSitesTable
              sites={processedSites}
              onSelect={setSelectedSite}
            />
          )}
          {activeTab === "Recommendations" && (
            <RecommendationsList items={processedSites} />
          )}
          {activeTab === "Monitoring" && (
            <MonitoringTable
              entries={processedSites}
              onArchive={handleArchiveSite}
            />
          )}
        </div>
      </main>

      {/* Row detail click-through modal display */}
      {selectedSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-[8px] border border-[#DEDBD1] bg-white p-6 shadow-lg">
            <div className="flex items-center justify-between border-b border-[#DEDBD1] pb-3">
              <h3 className="font-serif text-[17px] text-[#3A2A12]">{selectedSite.name}</h3>
              <button
                type="button"
                onClick={() => setSelectedSite(null)}
                className="text-[18px] text-[#8A8D86] hover:text-[#3A2A12]"
              >
                &times;
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-[13px] max-h-[70vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">Region</span>
                  <span className="text-[#3A4048]">{selectedSite.region}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">Priority Score</span>
                  <div className="flex items-center gap-1">
                    <span className="text-[15px] font-bold text-[#BB892C]">{selectedSite.priorityScore}</span>
                    <span className="text-[11px] text-[#8A8D86]">/ 100</span>
                  </div>
                </div>
              </div>

              {/* Priority score audit breakdown */}
              <div className="rounded-[6px] border border-[#DEDBD1]/60 bg-[#FAF6EB]/30 p-3">
                <span className="block text-[11.5px] text-[#8A8D86] uppercase font-semibold mb-2">Rule-Based Priority Score Breakdown</span>
                <div className="space-y-1 text-[12.5px]">
                  <div className="flex justify-between">
                    <span className="text-[#5B6472]">Base Cluster Risk Weight (S_risk):</span>
                    <span className="font-semibold text-[#3A2A12]">{selectedSite.baseRiskWeight ?? (selectedSite.riskLevel === "High" ? 45 : selectedSite.riskLevel === "Medium" ? 30 : 15)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6472]">Hazard indicators (H_hazard):</span>
                    <span className="font-semibold text-[#3A2A12]">{selectedSite.hazardScore ?? 0} / 20</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#5B6472]">Heritage Significance (S_sig):</span>
                    <span className="font-semibold text-[#3A2A12]">{selectedSite.significanceWeight ?? 24} / 30</span>
                  </div>
                  <div className="h-px bg-[#DEDBD1]/60 my-1.5" />
                  <div className="flex justify-between font-bold">
                    <span className="text-[#3A2A12]">Total Audited Score:</span>
                    <span className="text-[#BB892C]">{selectedSite.priorityScore} / 100</span>
                  </div>
                </div>
              </div>

              {/* AI Risk Prediction output card */}
              <div className="rounded-[6px] border border-[#DEDBD1]/60 bg-white p-3.5 shadow-xs">
                <span className="block text-[11.5px] text-[#8A8D86] uppercase font-semibold mb-2">AI Risk Prediction (Classifier Output)</span>
                <div className="flex items-center justify-between mb-3 bg-[#FAF6EB]/40 px-3 py-2 rounded-[6px] border border-[#DEDBD1]/40">
                  <div>
                    <span className="block text-[9.5px] text-[#8A8D86]">Predicted Risk Level</span>
                    <span className="text-[13.5px] font-bold text-[#9A4B2E]">
                      {selectedSite.aiPrediction?.riskLevel ?? (selectedSite.priorityScore >= 80 ? "Critical" : selectedSite.priorityScore >= 50 ? "High" : "Medium")}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9.5px] text-[#8A8D86]">Classifier Confidence</span>
                    <span className="text-[13.5px] font-semibold text-[#2C6B33]">
                      {selectedSite.aiPrediction?.confidence ?? 84}%
                    </span>
                  </div>
                  <div>
                    <span className="inline-block bg-[#BB892C]/10 text-[#BB892C] text-[9.5px] px-2 py-0.5 rounded font-mono">
                      Model: {selectedSite.aiPrediction?.modelVersion ?? "synthetic-v1"}
                    </span>
                  </div>
                </div>

                {/* Feature Importance Mini Chart */}
                <div className="mt-3">
                  <span className="block text-[10.5px] font-semibold text-[#3A2A12] mb-2">Classifier Feature Impact Weights</span>
                  <div className="space-y-2">
                    {(selectedSite.aiPrediction?.featureImportance ?? [
                      { feature: "Flood Vulnerability", weight: 35 },
                      { feature: "Looting Risk", weight: 25 },
                      { feature: "Elevation", weight: 15 },
                      { feature: "Urban Encroachment", weight: 15 },
                      { feature: "Soil Erosion", weight: 10 }
                    ]).map((imp: any, idx: number) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between text-[10px] text-[#5B6472]">
                          <span>{imp.feature}</span>
                          <span className="font-semibold">{imp.weight}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-[#FAF6EB] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-[#BB892C] rounded-full transition-all duration-500" 
                            style={{ width: `${imp.weight}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">GPS Coordinates</span>
                  <span className="text-[#3A4048]">Lat: {selectedSite.lat ?? 8.450}, Lng: {selectedSite.lng ?? 80.420}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">Cluster Assignment</span>
                  <span className="text-[#3A4048]">{selectedSite.clusterName ?? "Zone A"} ({selectedSite.algorithmUsed ?? "K-Means"})</span>
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">Active Input Variables</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(selectedSite.features ?? ["coordinates", "elevation", "flood zone"]).map((f, idx) => (
                    <span key={idx} className="rounded bg-[#FAF6EB] px-2 py-0.5 text-[11px] text-[#8F6A21] border border-[#DEDBD1]/60">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-[6px] bg-[#FBF0EB] p-3 border border-[#E3B9A8]/40">
                <span className="block text-[11.5px] font-semibold text-[#8A3A20] uppercase">Vulnerability Impact Warning</span>
                <p className="mt-1 text-[#8A3A20] text-[12px] leading-relaxed">
                  High flood probability and soil erosion indices are threatening foundations. Immediate preservation work recommended.
                </p>
              </div>

              <div>
                <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">Conservation Recommendation</span>
                <p className="mt-1 text-[#5B6472] italic leading-relaxed">&ldquo;{selectedSite.recommendation ?? "Establish rigid visitor buffer limits."}&rdquo;</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-[#DEDBD1]">
              <button
                type="button"
                onClick={() => setSelectedSite(null)}
                className="rounded-[6px] border border-[#DEDBD1] px-4 py-2 text-[13px] font-medium text-[#5B6472] hover:bg-[#FAF6EB] transition"
              >
                Close
              </button>
              <Link
                href="/admin/dashboard/gis-map"
                className="rounded-[6px] bg-[#BB892C] px-4 py-2 text-[13px] font-medium text-[#F4F2ED] hover:bg-[#8F6A21] transition text-center"
              >
                View on GIS Map
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PrioritizedSitesTable({ sites, onSelect }: { sites: PrioritizedSite[]; onSelect: (s: PrioritizedSite) => void }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="bg-[#3A2A12] text-[12px] text-[#F4F2ED]">
            <th className="px-5 py-3 font-medium">Site name</th>
            <th className="px-5 py-3 font-medium">Region</th>
            <th className="px-5 py-3 font-medium">Risk level</th>
            <th className="px-5 py-3 font-medium">Priority score</th>
            <th className="px-5 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DEDBD1]/60">
          {sites.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-5 py-6 text-center text-[#8A8D86]">
                No prioritized sites match the search queries.
              </td>
            </tr>
          ) : (
            sites.map((site, i) => (
              <tr
                key={site.id}
                className={"transition-colors hover:bg-[#FAF6EB]/40 cursor-pointer " + (i % 2 === 1 ? "bg-[#FAF6EB]/20" : "")}
                onClick={() => onSelect(site)}
              >
                <td className="px-5 py-3 text-[#3A2A12] font-semibold">{site.name}</td>
                <td className="px-5 py-3 text-[#3A4048]">{site.region}</td>
                <td className="px-5 py-3">
                  <RiskBadge level={site.riskLevel} />
                </td>
                <td className="px-5 py-3 font-bold text-[#BB892C]">{site.priorityScore}</td>
                <td className="px-5 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSelect(site)}
                    className="text-[13px] font-medium text-[#BB892C] hover:underline"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function RecommendationsList({ items }: { items: PrioritizedSite[] }) {
  return (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="rounded-[8px] border border-[#DEDBD1] bg-white py-12 text-center text-[#8A8D86]">
          No recommendations match filters.
        </div>
      ) : (
        items.map((item) => (
          <div key={item.id} className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4 transition hover:border-[#BB892C]/20 hover:shadow-xs">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[#3A2A12]">{item.name}</h3>
              <RiskBadge level={item.riskLevel} />
            </div>
            <p className="mt-2 text-[13px] leading-relaxed text-[#5B6472] font-medium">
              <span className="text-[#8F6A21] font-bold">Conservation Action:</span> {item.recommendation ?? "Establish rigid visitor limits."}
            </p>
            <p className="mt-1 text-[11.5px] text-[#8A8D86]">
              Determined via {item.algorithmUsed ?? "K-Means"} modeling using {item.features?.join(", ") ?? "coordinates"}.
            </p>
          </div>
        ))
      )}
    </div>
  );
}

function MonitoringTable({ entries, onArchive }: { entries: PrioritizedSite[]; onArchive: (id: string) => void }) {
  return (
    <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="bg-[#3A2A12] text-[12px] text-[#F4F2ED]">
            <th className="px-5 py-3 font-medium">Site name</th>
            <th className="px-5 py-3 font-medium">Condition</th>
            <th className="px-5 py-3 font-medium">Last checked</th>
            <th className="px-5 py-3 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DEDBD1]/60">
          {entries.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-5 py-6 text-center text-[#8A8D86]">
                No monitoring entries match the filter criteria.
              </td>
            </tr>
          ) : (
            entries.map((entry, i) => (
              <tr key={entry.id} className={i % 2 === 1 ? "bg-[#FAF6EB]/20" : undefined}>
                <td className="px-5 py-3 text-[#3A2A12] font-semibold">{entry.name}</td>
                <td className="px-5 py-3">
                  <ConditionBadge condition={(entry.condition ?? "Stable") as SiteCondition} />
                </td>
                <td className="px-5 py-3 text-[#3A4048]">{entry.lastChecked ?? "2026-07-01"}</td>
                <td className="px-5 py-3 text-right">
                  {entry.condition !== "Archived" ? (
                    <button
                      type="button"
                      onClick={() => onArchive(entry.id)}
                      className="text-[13px] font-medium text-[#B03A2E] hover:underline"
                    >
                      Archive record
                    </button>
                  ) : (
                    <span className="text-[11.5px] italic text-[#8A8D86]">Archived</span>
                  )}
                </td>
              </tr>
            ))
          )}
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
    <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${styles[level]}`}>
      {level}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: SiteCondition }) {
  const styles: Record<SiteCondition, string> = {
    Stable: "bg-[#EAF1EA] text-[#2F5C3B]",
    "At risk": "bg-[#F6E8E3] text-[#9A4B2E]",
    "Under conservation": "bg-[#FAF6EB] text-[#8A8478]",
    Archived: "bg-[#F0F0F0] text-[#7A7A7A] border border-[#DEDBD1]",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${styles[condition]}`}>
      {condition}
    </span>
  );
}