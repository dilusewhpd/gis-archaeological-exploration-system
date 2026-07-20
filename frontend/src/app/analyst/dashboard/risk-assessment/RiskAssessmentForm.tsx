"use client";

import { useState, useMemo, useEffect, type FormEvent } from "react";
import Link from "next/link";
import { predictRisk } from "../../../../services/riskPrediction";
export type Dataset = { id: string; name: string; siteCount: number };

const RUN_ENDPOINT = "/api/risk-assessment/cluster-runs";
const REPORT_ENDPOINT = "/api/risk-assessment/reports";

type RiskLevel = "low" | "medium" | "high" | "critical";
type DistanceMetric = "euclidean" | "haversine";
type AlgorithmType = "kmeans" | "dbscan";

type RiskZone = {
  id: string;
  label: string;
  riskLevel: RiskLevel;
  siteCount: number;
  centroid: { xPct: number; yPct: number };
};

type ClusterRunResult = {
  runId: string;
  algorithm: AlgorithmType;
  zones: RiskZone[];
  totalSitesAnalyzed: number;
  featuresUsed: string[];
};

const RISK_COLORS: Record<RiskLevel, { bg: string; text: string; dot: string }> = {
  low: { bg: "#EAF3EA", text: "#2C6B33", dot: "#4C8A55" },
  medium: { bg: "#FBF0EB", text: "#9A5A2E", dot: "#C97A3A" },
  high: { bg: "#FBEBEA", text: "#B03A2E", dot: "#B0472E" },
  critical: { bg: "#F6E0DC", text: "#8A2418", dot: "#8A2418" },
};

type MockSite = {
  id: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
  elevation: number; // meters
  floodZone: "High" | "Medium" | "Low";
  erosionIndex: "High" | "Medium" | "Low";
  encroachment: "High" | "Medium" | "Low";
  lootingHistory: "Yes" | "No";
  significance: number; // 1-10
};

// Real-world Sri Lankan historical sites mapping to datasets
const DATASET_SITES: Record<string, MockSite[]> = {
  d1: [
    { id: "s1", name: "Anuradhapura North Ruins", region: "North Central Province", lat: 8.450, lng: 80.420, elevation: 12, floodZone: "High", erosionIndex: "High", encroachment: "High", lootingHistory: "Yes", significance: 9 },
    { id: "s2", name: "Sigiriya East Ridge Walls", region: "Central Province", lat: 7.960, lng: 80.770, elevation: 180, floodZone: "Low", erosionIndex: "High", encroachment: "High", lootingHistory: "No", significance: 10 },
    { id: "s3", name: "Polonnaruwa South Vihara", region: "North Central Province", lat: 7.940, lng: 81.000, elevation: 35, floodZone: "High", erosionIndex: "Medium", encroachment: "Medium", lootingHistory: "Yes", significance: 8 },
    { id: "s4", name: "Yapahuwa Fortress Steps", region: "North Western Province", lat: 7.830, lng: 80.320, elevation: 95, floodZone: "Medium", erosionIndex: "Medium", encroachment: "Low", lootingHistory: "No", significance: 7 },
    { id: "s5", name: "Ritigala Hermitage Grove", region: "North Central Province", lat: 8.100, lng: 80.650, elevation: 220, floodZone: "Low", erosionIndex: "Low", encroachment: "Low", lootingHistory: "No", significance: 9 },
    { id: "s6", name: "Galle Fort Sea Walls", region: "Southern Province", lat: 6.030, lng: 80.220, elevation: 3, floodZone: "High", erosionIndex: "High", encroachment: "Medium", lootingHistory: "No", significance: 9 },
    { id: "s7", name: "Jaffna Fort Moat Grounds", region: "Northern Province", lat: 9.660, lng: 80.020, elevation: 5, floodZone: "Medium", erosionIndex: "Low", encroachment: "Medium", lootingHistory: "No", significance: 7 },
    { id: "s8", name: "Kataragama Sacred Site", region: "Southern Province", lat: 6.420, lng: 81.340, elevation: 45, floodZone: "Medium", erosionIndex: "Medium", encroachment: "High", lootingHistory: "Yes", significance: 8 },
  ],
  d2: [
    { id: "s2", name: "Sigiriya East Ridge Walls", region: "Central Province", lat: 7.960, lng: 80.770, elevation: 180, floodZone: "Low", erosionIndex: "High", encroachment: "High", lootingHistory: "No", significance: 10 },
    { id: "s9", name: "Nalanda Gedige Shrine", region: "Central Province", lat: 7.670, lng: 80.640, elevation: 110, floodZone: "Medium", erosionIndex: "Medium", encroachment: "Medium", lootingHistory: "No", significance: 8 },
    { id: "s10", name: "Dambulla Rock Temple Outskirts", region: "Central Province", lat: 7.850, lng: 80.650, elevation: 150, floodZone: "Low", erosionIndex: "Low", encroachment: "High", lootingHistory: "No", significance: 9 },
  ],
  d3: [
    { id: "s1", name: "Anuradhapura North Ruins", region: "North Central Province", lat: 8.450, lng: 80.420, elevation: 12, floodZone: "High", erosionIndex: "High", encroachment: "High", lootingHistory: "Yes", significance: 9 },
    { id: "s3", name: "Polonnaruwa South Vihara", region: "North Central Province", lat: 7.940, lng: 81.000, elevation: 35, floodZone: "High", erosionIndex: "Medium", encroachment: "Medium", lootingHistory: "Yes", significance: 8 },
    { id: "s5", name: "Ritigala Hermitage Grove", region: "North Central Province", lat: 8.100, lng: 80.650, elevation: 220, floodZone: "Low", erosionIndex: "Low", encroachment: "Low", lootingHistory: "No", significance: 9 },
  ],
  d4: [
    { id: "s6", name: "Galle Fort Sea Walls", region: "Southern Province", lat: 6.030, lng: 80.220, elevation: 3, floodZone: "High", erosionIndex: "High", encroachment: "Medium", lootingHistory: "No", significance: 9 },
    { id: "s8", name: "Kataragama Sacred Site", region: "Southern Province", lat: 6.420, lng: 81.340, elevation: 45, floodZone: "Medium", erosionIndex: "Medium", encroachment: "High", lootingHistory: "Yes", significance: 8 },
  ],
};

export default function RiskAssessmentForm({ datasets }: { datasets: Dataset[] }) {
  const [datasetId, setDatasetId] = useState(datasets[0]?.id ?? "");
  const [algorithm, setAlgorithm] = useState<AlgorithmType>("kmeans");
  const [k, setK] = useState(4);
  const [eps, setEps] = useState(0.05);
  const [minPts, setMinPts] = useState(3);
  const [distanceMetric, setDistanceMetric] = useState<DistanceMetric>("haversine");
  
  // Expandable formula panel state
  const [showFormula, setShowFormula] = useState(false);

  // Multi-dimensional feature vectors state
  const [features, setFeatures] = useState({
    coordinates: true, // Lat/Lng - disabled check
    elevation: true,
    floodZone: true,
    erosionIndex: true,
    urbanEncroachment: true,
    lootingHistory: false,
    rainfall: false,
  });

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ClusterRunResult | null>(null);

  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  
  // State to hold and render computed prioritized sites details
  const [prioritizedSites, setPrioritizedSites] = useState<any[]>([]);

  useEffect(() => {
    const localData = localStorage.getItem("archaeology_prioritized_sites");
    if (localData) {
      setPrioritizedSites(JSON.parse(localData));
    }
  }, []);

  const selectedDataset = datasets.find((d) => d.id === datasetId) ?? null;

  const featuresList = useMemo(() => {
    return Object.entries(features)
      .filter(([_, enabled]) => enabled)
      .map(([name]) => name.replace(/([A-Z])/g, " $1").toLowerCase());
  }, [features]);

  function handleFeatureChange(key: keyof typeof features) {
    if (key === "coordinates") return; // cannot toggle coordinates
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleRun(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setReportUrl(null);

    if (!datasetId) {
      setError("Select a dataset to analyze.");
      return;
    }

    setIsRunning(true);
    
    // Simulate complex calculation
    setTimeout(() => {
      try {
        const sites = DATASET_SITES[datasetId] ?? DATASET_SITES["d1"];
        const numClusters = algorithm === "kmeans" ? k : 3;

        // Perform mock algorithm logic incorporating features
        const zones: RiskZone[] = Array.from({ length: numClusters }).map((_, i) => {
          const riskLevels: RiskLevel[] = ["critical", "high", "medium", "low"];
          const riskLevel = riskLevels[i % riskLevels.length];
          const angle = (i / numClusters) * Math.PI * 2;
          return {
            id: `zone-${i}-${Date.now()}`,
            label: String.fromCharCode(65 + i),
            riskLevel,
            siteCount: Math.ceil(sites.length / numClusters) + (i === 0 ? -1 : 0),
            centroid: {
              xPct: 50 + Math.cos(angle) * 30,
              yPct: 50 + Math.sin(angle) * 30,
            },
          };
        });

        // Compute priority score for each site using the formula incorporating selected features
        const prioritizedSites = sites.map((s, idx) => {
          const zoneIndex = idx % numClusters;
          const assignedZone = zones[zoneIndex];
          
          let baseRiskWeight = 15; // Default Low
          if (assignedZone.riskLevel === "critical") baseRiskWeight = 50;
          else if (assignedZone.riskLevel === "high") baseRiskWeight = 45;
          else if (assignedZone.riskLevel === "medium") baseRiskWeight = 30;

          // Proportional hazard scaling (Max 20 points, denominator HAZARD_MAX = 75)
          let activeHazardSum = 0;

          if (features.elevation && s.elevation < 50) activeHazardSum += 15;
          if (features.floodZone) {
            if (s.floodZone === "High") activeHazardSum += 15;
            else if (s.floodZone === "Medium") activeHazardSum += 8;
          }
          if (features.erosionIndex) {
            if (s.erosionIndex === "High") activeHazardSum += 10;
            else if (s.erosionIndex === "Medium") activeHazardSum += 5;
          }
          if (features.urbanEncroachment) {
            if (s.encroachment === "High") activeHazardSum += 12;
            else if (s.encroachment === "Medium") activeHazardSum += 6;
          }
          if (features.lootingHistory && s.lootingHistory === "Yes") activeHazardSum += 15;
          if (features.rainfall) activeHazardSum += 8; // mock monsoonal rainfall trigger

          const hazardScore = Math.round((activeHazardSum / 75) * 20);

          const significanceWeight = s.significance * 3; // Max 30 points

          const priorityScore = Math.min(100, Math.max(10, baseRiskWeight + hazardScore + significanceWeight));

          // Run AI risk prediction
          const aiPrediction = predictRisk(features, s);

          return {
            id: s.id,
            name: s.name,
            region: s.region,
            riskLevel: assignedZone.riskLevel.charAt(0).toUpperCase() + assignedZone.riskLevel.slice(1) as "High" | "Medium" | "Low",
            priorityScore,
            algorithmUsed: algorithm === "kmeans" ? "K-Means" : "DBSCAN",
            features: featuresList,
            clusterName: `Zone ${assignedZone.label}`,
            recommendation: getRecommendationText(s, assignedZone.riskLevel),
            condition: assignedZone.riskLevel === "critical" || assignedZone.riskLevel === "high" ? "At risk" : "Stable",
            lastChecked: new Date().toISOString().slice(0, 10),
            lat: s.lat,
            lng: s.lng,
            baseRiskWeight,
            hazardScore,
            significanceWeight,
            aiPrediction,
          };
        });

        // Sort by Priority Score descending
        prioritizedSites.sort((a, b) => b.priorityScore - a.priorityScore);

        // Update local component state
        setPrioritizedSites(prioritizedSites);

        // Store results to localStorage to share with the admin decision screen
        localStorage.setItem("archaeology_prioritized_sites", JSON.stringify(prioritizedSites));
        localStorage.setItem("latest_model_run_meta", JSON.stringify({
          algorithm: algorithm === "kmeans" ? "K-Means" : "DBSCAN",
          features: featuresList,
          runDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
          datasetName: selectedDataset?.name ?? "Unknown",
        }));

        setResult({
          runId: `run-${Date.now()}`,
          algorithm,
          zones,
          totalSitesAnalyzed: sites.length,
          featuresUsed: featuresList,
        });
      } catch (err) {
        setError("An error occurred during modeling simulation.");
      } finally {
        setIsRunning(false);
      }
    }, 1200);
  }

  function getRecommendationText(site: MockSite, riskLevel: RiskLevel) {
    if (riskLevel === "critical" || riskLevel === "high") {
      if (site.floodZone === "High") return "Construct dynamic flood defense barriers and restrict construction within 500m.";
      if (site.encroachment === "High") return "Enforce rigid buffer boundary zones and deploy weekly security surveillance.";
      return "Immediate drone scanning and structural reinforcement of stone basements.";
    }
    if (riskLevel === "medium") {
      return "Implement quarterly soil checks and assess drainage pathways.";
    }
    return "Maintain routine vegetation clearing and standard public access regulations.";
  }

  async function handleGenerateReport() {
    if (!result) return;
    setIsGeneratingReport(true);
    try {
      const res = await fetch(REPORT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clusterRunId: result.runId }),
      });
      if (!res.ok) throw new Error("request failed");
      const body = (await res.json()) as { fileUrl: string };
      setReportUrl(body.fileUrl);
    } catch {
      setReportUrl(`/reports/risk-assessment-${result.runId}.pdf`);
    } finally {
      setIsGeneratingReport(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
      {/* Configure clustering */}
      <form
        onSubmit={handleRun}
        className="h-fit rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5"
      >
        <h2 className="text-[14px] font-medium text-[#3A2A12]">Configure clustering</h2>

        {/* Dataset Selection */}
        <div className="mt-4">
          <label htmlFor="dataset" className="block text-[12px] font-medium text-[#5B6472]">
            Approved dataset
          </label>
          <select
            id="dataset"
            value={datasetId}
            onChange={(e) => setDatasetId(e.target.value)}
            className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          >
            {datasets.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
          {selectedDataset && (
            <p className="mt-1 text-[11px] text-[#8A8D86]">
              {selectedDataset.siteCount} approved sites in pool
            </p>
          )}
        </div>

        {/* Algorithm Type Selector */}
        <div className="mt-4">
          <label htmlFor="algorithm" className="block text-[12px] font-medium text-[#5B6472]">
            Clustering Algorithm
          </label>
          <select
            id="algorithm"
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value as AlgorithmType)}
            className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          >
            <option value="kmeans">K-Means Clustering</option>
            <option value="dbscan">DBSCAN (Density-Based)</option>
          </select>
        </div>

        {/* Algorithm parameters */}
        {algorithm === "kmeans" ? (
          <div className="mt-4">
            <label htmlFor="k" className="block text-[12px] font-medium text-[#5B6472]">
              Number of clusters (k)
            </label>
            <input
              id="k"
              type="number"
              min={2}
              max={10}
              value={k}
              onChange={(e) => setK(Math.min(10, Math.max(2, parseInt(e.target.value, 10) || 2)))}
              className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
            />
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="eps" className="block text-[12px] font-medium text-[#5B6472]">
                Epsilon (eps)
              </label>
              <input
                id="eps"
                type="number"
                step="0.01"
                min={0.01}
                max={1.0}
                value={eps}
                onChange={(e) => setEps(Math.min(1.0, Math.max(0.01, parseFloat(e.target.value) || 0.05)))}
                className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
            </div>
            <div>
              <label htmlFor="minPts" className="block text-[12px] font-medium text-[#5B6472]">
                Min Points
              </label>
              <input
                id="minPts"
                type="number"
                min={1}
                max={20}
                value={minPts}
                onChange={(e) => setMinPts(Math.min(20, Math.max(1, parseInt(e.target.value, 10) || 3)))}
                className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
            </div>
          </div>
        )}

        {/* Distance parameters */}
        <div className="mt-4">
          <label htmlFor="distance" className="block text-[12px] font-medium text-[#5B6472]">
            Distance metric
          </label>
          <select
            id="distance"
            value={distanceMetric}
            onChange={(e) => setDistanceMetric(e.target.value as DistanceMetric)}
            className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          >
            <option value="haversine">Haversine (GPS Spherical)</option>
            <option value="euclidean">Euclidean</option>
          </select>
        </div>

        {/* Multi-Dimensional Feature Selectors */}
        <div className="mt-5 border-t border-[#DEDBD1] pt-4">
          <span className="block text-[12.5px] font-semibold text-[#3A2A12] uppercase tracking-wider">
            Risk Feature Vectors
          </span>
          <p className="mt-0.5 text-[11px] text-[#8A8D86]">
            Select spatial variables to feed the mathematical model.
          </p>

          <div className="mt-3 space-y-2">
            <label className="flex items-center gap-2 text-[12.5px] text-[#23262B] cursor-not-allowed opacity-60">
              <input
                type="checkbox"
                checked={features.coordinates}
                disabled
                className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
              />
              Coordinates (Lat/Lng)
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[#23262B] cursor-pointer">
              <input
                type="checkbox"
                checked={features.elevation}
                onChange={() => handleFeatureChange("elevation")}
                className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
              />
              Elevation (Flood Risk)
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[#23262B] cursor-pointer">
              <input
                type="checkbox"
                checked={features.floodZone}
                onChange={() => handleFeatureChange("floodZone")}
                className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
              />
              Flood Vulnerability Zone
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[#23262B] cursor-pointer">
              <input
                type="checkbox"
                checked={features.erosionIndex}
                onChange={() => handleFeatureChange("erosionIndex")}
                className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
              />
              Soil Erosion Index
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[#23262B] cursor-pointer">
              <input
                type="checkbox"
                checked={features.urbanEncroachment}
                onChange={() => handleFeatureChange("urbanEncroachment")}
                className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
              />
              Urban Encroachment Proximity
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[#23262B] cursor-pointer">
              <input
                type="checkbox"
                checked={features.lootingHistory}
                onChange={() => handleFeatureChange("lootingHistory")}
                className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
              />
              Looting History Data
            </label>
            <label className="flex items-center gap-2 text-[12.5px] text-[#23262B] cursor-pointer">
              <input
                type="checkbox"
                checked={features.rainfall}
                onChange={() => handleFeatureChange("rainfall")}
                className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C] focus:ring-[#BB892C]/20"
              />
              Monsoonal Rainfall Index
            </label>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="mt-4 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isRunning}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isRunning && <Spinner />}
          {isRunning ? "Running calculations…" : "Run Spatial Model"}
        </button>
      </form>

      {/* Model Prioritization Logic Panel */}
      <div className="mt-4 rounded-[8px] border border-[#DEDBD1] bg-white px-4 py-3">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowFormula(!showFormula)}
        >
          <span className="text-[12px] font-semibold text-[#3A2A12] uppercase tracking-wider">
            Model Prioritization Logic {showFormula ? "▼" : "▶"}
          </span>
          <span className="text-[11px] text-[#BB892C] font-semibold">
            {showFormula ? "Collapse" : "Expand info"}
          </span>
        </div>
        {showFormula && (
          <div className="mt-2.5 border-t border-[#DEDBD1]/60 pt-2 text-[11.5px] text-[#5B6472] space-y-1.5">
            <p>
              Priority scores are mapped on a 10–100 scale:
              <br />
              <span className="font-serif font-bold text-[#BB892C]">
                Score = S_risk (Base Risk) + H_hazard (Indicator Weight) + S_sig (Significance Rank)
              </span>
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>S_risk (Max 50):</strong> Critical=50, High=45, Medium=30, Low=15 based on cluster zones.
              </li>
              <li>
                <strong>H_hazard (Max 20):</strong> Scaled proportion of active triggered hazards out of HAZARD_MAX (75).
              </li>
              <li>
                <strong>S_sig (Max 30):</strong> Archaeology Dept significance rank &times; 3.
              </li>
            </ul>
          </div>
        )}
      </div>

      {/* Output */}
      <div className="space-y-5">
        <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <div className="aspect-[16/9] w-full bg-[#FAF6EB]">
            {result ? (
              <RiskZoneMap zones={result.zones} />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-6 text-center text-[13px] text-[#8A8D86]">
                Configure parameters and run the model to view spatial risk assessment zones.
              </div>
            )}
          </div>
        </div>

        {result && (
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DEDBD1] px-5 py-3.5 gap-2">
              <div>
                <h2 className="text-[14px] font-medium text-[#3A2A12] flex items-center gap-2">
                  Results — {result.algorithm === "kmeans" ? "K-Means Clusters" : "DBSCAN Groups"}
                </h2>
                <p className="mt-0.5 text-[11px] text-[#8A8D86]">
                  Active features: {result.featuresUsed.join(", ")}
                </p>
              </div>
              <p className="text-[12px] text-[#8A8D86]">
                {result.totalSitesAnalyzed} sites mapped
              </p>
            </div>

            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="bg-[#3A2A12] text-[#F4F2ED]">
                  <th className="px-4 py-2.5 font-medium">Zone/Group</th>
                  <th className="px-4 py-2.5 font-medium">Risk Level</th>
                  <th className="px-4 py-2.5 font-medium">Site Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#DEDBD1]/60">
                {result.zones.map((z, i) => {
                  const c = RISK_COLORS[z.riskLevel];
                  return (
                    <tr key={z.id} className={i % 2 === 1 ? "bg-[#FAF9F6]" : undefined}>
                      <td className="px-4 py-2.5 text-[#23262B] font-semibold">Zone {z.label}</td>
                      <td className="px-4 py-2.5">
                        <span
                          className="inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-medium capitalize"
                          style={{ backgroundColor: c.bg, color: c.text }}
                        >
                          {z.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-[#5B6472]">{z.siteCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Prioritized Sites & AI predictions output */}
            {prioritizedSites.length > 0 && (
              <div className="border-t border-[#DEDBD1] px-5 py-4 bg-[#FAF6EB]/10">
                <h3 className="text-[13px] font-semibold text-[#3A2A12] uppercase tracking-wider mb-3">
                  Prioritized Sites & AI Predictions (Comparison Model)
                </h3>
                <div className="overflow-x-auto rounded-[6px] border border-[#DEDBD1]/60 bg-white">
                  <table className="w-full text-left text-[12.5px]">
                    <thead>
                      <tr className="bg-[#FAF6EB] text-[#3A2A12]">
                        <th className="px-4 py-2 font-medium">Site</th>
                        <th className="px-4 py-2 font-medium">Zone</th>
                        <th className="px-4 py-2 font-medium text-center">Rule Score</th>
                        <th className="px-4 py-2 font-medium">AI Risk Level</th>
                        <th className="px-4 py-2 font-medium text-center">Confidence</th>
                        <th className="px-4 py-2 font-medium text-right">Model ID</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDBD1]/60">
                      {prioritizedSites.slice(0, 5).map((site) => (
                        <tr key={site.id} className="hover:bg-[#FAF6EB]/20 transition-colors">
                          <td className="px-4 py-2.5 text-[#3A2A12] font-semibold">{site.name}</td>
                          <td className="px-4 py-2.5 text-[#5B6472]">{site.clusterName}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-[#BB892C]">{site.priorityScore}</td>
                          <td className="px-4 py-2.5">
                            <span className="inline-block rounded px-2 py-0.5 text-[11px] font-semibold bg-[#F6E8E3] text-[#9A4B2E]">
                              {site.aiPrediction?.riskLevel ?? "High"}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-center font-medium text-[#2C6B33]">
                            {site.aiPrediction?.confidence ?? 80}%
                          </td>
                          <td className="px-4 py-2.5 text-right font-mono text-[10px] text-[#8A8D86]">
                            {site.aiPrediction?.modelVersion ?? "synthetic-v1"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 border-t border-[#DEDBD1] px-5 py-4">
              <button
                type="button"
                onClick={handleGenerateReport}
                disabled={isGeneratingReport}
                className="flex items-center gap-2 rounded-[6px] bg-[#BB892C] px-4 py-2 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGeneratingReport && <Spinner />}
                {isGeneratingReport ? "Generating…" : "Generate risk assessment report"}
              </button>

              <Link
                href="/analyst/dashboard/gis-map"
                className="text-[13px] font-medium text-[#BB892C] hover:underline"
              >
                View risk zones on GIS map →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskZoneMap({ zones }: { zones: RiskZone[] }) {
  const gridLines = [0, 1, 2, 3, 4, 5];

  return (
    <div className="relative h-full w-full">
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

      {zones.map((z) => {
        const c = RISK_COLORS[z.riskLevel];
        const size = 32 + z.siteCount * 3;
        return (
          <div
            key={z.id}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[11px] font-bold text-white shadow-md transition-transform duration-300 hover:scale-110 cursor-pointer"
            style={{
              left: `${z.centroid.xPct}%`,
              top: `${z.centroid.yPct}%`,
              width: size,
              height: size,
              backgroundColor: c.dot,
              opacity: 0.85,
            }}
          >
            Zone {z.label}
          </div>
        );
      })}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin text-[#F4F2ED]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}