"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getSites, type ExplorationSite } from "@/src/services/siteService";
import { predictRisk, type HazardFeatures, type SiteDetails } from "@/src/services/riskPrediction";

export default function RiskAssessmentForm() {
  const [sites, setSites] = useState<ExplorationSite[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
  const [compareSiteIds, setCompareSiteIds] = useState<string[]>([]);
  
  // Pipeline Simulation states
  const [pipelineSiteId, setPipelineSiteId] = useState<string>("");
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);
  const [pipelineOutput, setPipelineOutput] = useState<any | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "compare" | "pipeline">("list");

  useEffect(() => {
    // Only fetch APPROVED sites for risk assessment analysis
    const approvedSites = getSites().filter(s => s.status === "APPROVED");
    setSites(approvedSites);
    if (approvedSites.length > 0) {
      setSelectedSiteId(approvedSites[0].id);
      setPipelineSiteId(approvedSites[0].id);
    }
  }, []);

  const approvedSites = useMemo(() => {
    return sites.filter((s) => {
      if (riskFilter && s.riskBand !== riskFilter) return false;
      if (search.trim() && !s.name.toLowerCase().includes(search.toLowerCase().trim())) return false;
      return true;
    });
  }, [sites, search, riskFilter]);

  const selectedSite = useMemo(() => {
    return sites.find(s => s.id === selectedSiteId) ?? null;
  }, [sites, selectedSiteId]);

  function handleRunPipelineSimulation(e: React.MouseEvent) {
    e.preventDefault();
    if (!pipelineSiteId) return;
    const targetSite = sites.find(s => s.id === pipelineSiteId);
    if (!targetSite) return;

    setPipelineStep(0);
    setPipelineOutput(null);

    // Step 0: Extract Features
    setTimeout(() => {
      setPipelineStep(1);
    }, 600);

    // Step 1: Run AI Prediction model
    setTimeout(() => {
      setPipelineStep(2);
    }, 1200);

    // Step 2: Calculate Risk Score
    setTimeout(() => {
      setPipelineStep(3);
    }, 1800);

    // Step 3: Classify Risk Level & Update GIS Map
    setTimeout(() => {
      setPipelineStep(4);
      
      const features: HazardFeatures = {
        elevation: true,
        floodZone: true,
        erosionIndex: true,
        urbanEncroachment: true,
        lootingHistory: true,
        rainfall: true
      };

      const siteDetails: SiteDetails = {
        elevation: targetSite.elevation,
        floodZone: targetSite.floodZone,
        erosionIndex: targetSite.erosionIndex,
        encroachment: targetSite.encroachment,
        lootingHistory: targetSite.lootingHistory,
        significance: targetSite.significance
      };

      const prediction = predictRisk(features, siteDetails);
      setPipelineOutput(prediction);
    }, 2400);
  }

  function handleToggleCompare(id: string) {
    setCompareSiteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  }

  function handleExportCSV() {
    if (sites.length === 0) return;
    const headers = "ID,Name,District,Latitude,Longitude,Significance,Elevation,FloodZone,ErosionIndex,UrbanEncroachment,LootingHistory,RiskScore,RiskBand\n";
    const rows = sites.map(s => 
      `"${s.id}","${s.name}","${s.district}",${s.lat},${s.lng},${s.significance},${s.elevation},"${s.floodZone}","${s.erosionIndex}","${s.encroachment}","${s.lootingHistory}",${s.riskScore ?? 0},"${s.riskBand ?? 'PENDING'}"`
    ).join("\n");
    
    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Archeological_AI_Risk_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      
      {/* LEFT: AI Model Configuration Overview */}
      <div className="space-y-4">
        <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
          <h2 className="text-[14px] font-bold text-[#3A2A12] uppercase tracking-wider border-b border-[#DEDBD1]/60 pb-2 mb-3">AI Prediction Schema</h2>
          
          <div className="space-y-3.5 text-[12.5px] text-[#5B6472]">
            <div>
              <span className="block text-[11px] font-semibold text-[#8A8D86] uppercase">ACTIVE MODEL</span>
              <span className="font-mono font-semibold text-[#BB892C]">supervised-ai-v2</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-[#8A8D86] uppercase">CLASSIFIER ALGORITHM</span>
              <span className="font-medium text-[#3A2A12]">Supervised Random Forest Classifier</span>
            </div>
            <div>
              <span className="block text-[11px] font-semibold text-[#8A8D86] uppercase">FEATURE COEFFICIENTS</span>
              <div className="mt-1.5 space-y-1 text-[11.5px] font-medium">
                <div className="flex justify-between">
                  <span>Flood Zone Weight</span>
                  <span className="font-semibold text-[#3A2A12]">35%</span>
                </div>
                <div className="flex justify-between">
                  <span>Looting History Weight</span>
                  <span className="font-semibold text-[#3A2A12]">30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Elevation Hazard</span>
                  <span className="font-semibold text-[#3A2A12]">25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Soil Erosion / Urban proximity</span>
                  <span className="font-semibold text-[#3A2A12]">20% each</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-4.5 shadow-xs">
          <h3 className="text-[13px] font-bold text-[#3A2A12] mb-3">Actions</h3>
          <button
            onClick={handleExportCSV}
            className="w-full text-center rounded-[6px] bg-[#BB892C] px-3.5 py-2 text-[12.5px] font-medium text-[#F4F2ED] hover:bg-[#8F6A21] transition"
          >
            Export Risk Matrix (CSV)
          </button>
          <button
            onClick={() => window.print()}
            className="w-full mt-2 text-center rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2 text-[12.5px] font-medium text-[#5B6472] hover:bg-[#FAF6EB] transition"
          >
            Print Risk Summary
          </button>
        </div>
      </div>

      {/* RIGHT: Main analytical panel */}
      <div className="space-y-5">
        
        {/* Navigation Tabs */}
        <div className="flex gap-1.5 border-b border-[#DEDBD1]">
          <button
            type="button"
            onClick={() => setActiveTab("list")}
            className={`px-4 py-2.5 text-[13px] font-medium transition ${
              activeTab === "list" ? "border-b-2 border-[#BB892C] text-[#BB892C] font-semibold" : "text-[#8A8D86] hover:text-[#5B6472]"
            }`}
          >
            Risk Analysis Matrix
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("compare")}
            className={`px-4 py-2.5 text-[13px] font-medium transition ${
              activeTab === "compare" ? "border-b-2 border-[#BB892C] text-[#BB892C] font-semibold" : "text-[#8A8D86] hover:text-[#5B6472]"
            }`}
          >
            Compare Site Attributes
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("pipeline")}
            className={`px-4 py-2.5 text-[13px] font-medium transition ${
              activeTab === "pipeline" ? "border-b-2 border-[#BB892C] text-[#BB892C] font-semibold" : "text-[#8A8D86] hover:text-[#5B6472]"
            }`}
          >
            Pipeline Monitor Simulator
          </button>
        </div>

        {/* Tab contents */}
        {activeTab === "list" && (
          <div className="space-y-5">
            {/* Search and Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#DEDBD1] bg-white p-4">
              <input
                type="text"
                placeholder="Filter by site name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-[280px] rounded-[6px] border border-[#D4CFC3] px-3.5 py-1.5 text-[13px] outline-none"
              />

              <select
                value={riskFilter}
                onChange={(e) => setRiskFilter(e.target.value)}
                className="rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-1.5 text-[13px] outline-none"
              >
                <option value="">All Risk Bands</option>
                <option value="VERY_HIGH">Very High (76-100%)</option>
                <option value="HIGH">High (51-75%)</option>
                <option value="MODERATE">Moderate (26-50%)</option>
                <option value="LOW">Low (0-25%)</option>
              </select>
            </div>

            {/* Main split: Table + Selected detail Card */}
            <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-5">
              
              {/* Site list table */}
              <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
                <table className="w-full text-left text-[13px]">
                  <thead>
                    <tr className="bg-[#3A2A12] text-[#F4F2ED]">
                      <th className="px-4 py-2.5 font-medium w-10">Select</th>
                      <th className="px-4 py-2.5 font-medium">Approved Site</th>
                      <th className="px-4 py-2.5 font-medium">District</th>
                      <th className="px-4 py-2.5 font-medium text-center">Score</th>
                      <th className="px-4 py-2.5 font-medium text-right">Band</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#DEDBD1]/60">
                    {approvedSites.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-6 text-center text-[#8A8D86]">
                          No approved sites match filters.
                        </td>
                      </tr>
                    ) : (
                      approvedSites.map((s, idx) => (
                        <tr
                          key={s.id}
                          onClick={() => setSelectedSiteId(s.id)}
                          className={`hover:bg-[#FAF6EB]/40 cursor-pointer transition-colors ${
                            s.id === selectedSiteId ? "bg-[#FAF6EB]/60 font-semibold" : idx % 2 === 1 ? "bg-[#FAF9F6]" : ""
                          }`}
                        >
                          <td className="px-4 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={compareSiteIds.includes(s.id)}
                              onChange={() => handleToggleCompare(s.id)}
                              className="h-3.5 w-3.5 rounded border-[#D4CFC3] text-[#BB892C]"
                            />
                          </td>
                          <td className="px-4 py-2.5 text-[#3A2A12] font-semibold">{s.name}</td>
                          <td className="px-4 py-2.5 text-[#5B6472]">{s.district}</td>
                          <td className="px-4 py-2.5 text-center font-bold text-[#BB892C]">{s.riskScore}%</td>
                          <td className="px-4 py-2.5 text-right">
                            <RiskBandTag band={s.riskBand!} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Selected detail Risk Profile Card */}
              {selectedSite ? (
                <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs h-fit space-y-4">
                  <div className="border-b border-[#DEDBD1]/60 pb-3">
                    <span className="text-[10px] font-bold text-[#8A8D86] uppercase">Detailed AI Risk Profile</span>
                    <h3 className="font-serif text-[18px] text-[#3A2A12] mt-0.5">{selectedSite.name}</h3>
                    <p className="text-[12px] text-[#8A8478]">{selectedSite.district} District</p>
                  </div>

                  {/* Reusable Risk Score Display Component */}
                  <div className="flex items-center justify-between p-4 bg-[#FAF6EB]/40 rounded-[6px] border border-[#DEDBD1]/40">
                    <div>
                      <span className="block text-[9.5px] uppercase font-bold text-[#8A8D86]">AI Predicted score</span>
                      <span className="text-[32px] font-serif font-bold text-[#BB892C] leading-none mt-1 inline-block">{selectedSite.riskScore}%</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-[9.5px] uppercase font-bold text-[#8A8D86]">Vulnerability Band</span>
                      <div className="mt-1">
                        <RiskBandTag band={selectedSite.riskBand!} />
                      </div>
                    </div>
                  </div>

                  {/* Contributing features lists */}
                  <div className="space-y-2">
                    <span className="block text-[11px] font-bold text-[#3A2A12] uppercase tracking-wider">Contributing Risk Attributes</span>
                    
                    <div className="grid grid-cols-2 gap-2 text-[12px]">
                      <div className="p-2 bg-[#FAF9F6] border border-[#DEDBD1]/30 rounded">
                        <span className="text-[10px] text-[#8A8D86] block">Elevation</span>
                        <span className="font-medium text-[#3A2A12]">{selectedSite.elevation} meters</span>
                      </div>
                      <div className="p-2 bg-[#FAF9F6] border border-[#DEDBD1]/30 rounded">
                        <span className="text-[10px] text-[#8A8D86] block">Flood vulnerability</span>
                        <span className="font-medium text-[#3A2A12]">{selectedSite.floodZone}</span>
                      </div>
                      <div className="p-2 bg-[#FAF9F6] border border-[#DEDBD1]/30 rounded">
                        <span className="text-[10px] text-[#8A8D86] block">Soil erosion</span>
                        <span className="font-medium text-[#3A2A12]">{selectedSite.erosionIndex}</span>
                      </div>
                      <div className="p-2 bg-[#FAF9F6] border border-[#DEDBD1]/30 rounded">
                        <span className="text-[10px] text-[#8A8D86] block">Urban Encroachment</span>
                        <span className="font-medium text-[#3A2A12]">{selectedSite.encroachment}</span>
                      </div>
                      <div className="p-2 bg-[#FAF9F6] border border-[#DEDBD1]/30 rounded">
                        <span className="text-[10px] text-[#8A8D86] block">River Proximity</span>
                        <span className="font-medium text-[#3A2A12]">{selectedSite.distanceToRiver}</span>
                      </div>
                      <div className="p-2 bg-[#FAF9F6] border border-[#DEDBD1]/30 rounded">
                        <span className="text-[10px] text-[#8A8D86] block">Looting History</span>
                        <span className="font-medium text-[#3A2A12]">{selectedSite.lootingHistory}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[6px] border border-[#DEDBD1] bg-[#FAF6EB]/20 p-3.5 text-[12px] italic text-[#5B6472]">
                    &ldquo;{selectedSite.notes}&rdquo;
                  </div>
                </div>
              ) : (
                <div className="rounded-[8px] border border-dashed border-[#DEDBD1] bg-white p-12 text-center text-[#8A8D86] text-[13px]">
                  Select an approved site to inspect its AI risk prediction parameters.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Compare Sites */}
        {activeTab === "compare" && (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#DEDBD1]/60 pb-3 mb-4">
                <div>
                  <h3 className="font-serif text-[16px] text-[#3A2A12]">Side-by-Side Site Comparison Tool</h3>
                  <p className="text-[11.5px] text-[#8A8D86] mt-0.5">Select site checkboxes in the &quot;Risk Analysis Matrix&quot; tab to populate this comparison.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCompareSiteIds([])}
                  className="text-[12.5px] text-[#B03A2E] font-medium hover:underline"
                >
                  Clear selections
                </button>
              </div>

              {compareSiteIds.length === 0 ? (
                <div className="py-12 text-center text-[#8A8D86] text-[13px] border border-dashed border-[#DEDBD1]/60 rounded-[6px]">
                  No sites selected for comparison. Please go back to the first tab and select two or more checkboxes.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12.5px] border-collapse">
                    <thead>
                      <tr className="bg-[#FAF6EB] text-[#3A2A12]">
                        <th className="px-4 py-2.5 font-bold border border-[#DEDBD1]">VULNERABILITY PARAMETER</th>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return (
                            <th key={id} className="px-4 py-2.5 font-bold border border-[#DEDBD1] text-center bg-[#FAF6EB]/40 min-w-[150px]">
                              {s?.name}
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#DEDBD1]/60">
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-[#3A2A12] border border-[#DEDBD1]">AI Risk Score</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return (
                            <td key={id} className="px-4 py-2.5 text-center font-bold text-[15px] text-[#BB892C] border border-[#DEDBD1]">
                              {s?.riskScore}%
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-semibold text-[#3A2A12] border border-[#DEDBD1]">Risk Band Label</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return (
                            <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1]">
                              <RiskBandTag band={s?.riskBand!} />
                            </td>
                          );
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">District</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12]">{s?.district}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">Terrain Elevation</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12]">{s?.elevation} meters</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">Flood Zone Rating</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12] font-medium">{s?.floodZone}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">Soil Erosion Index</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12]">{s?.erosionIndex}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">Urban Encroachment</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12]">{s?.encroachment}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">Looting History Record</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12]">{s?.lootingHistory}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">Distance to River Margin</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12] font-mono text-[11.5px]">{s?.distanceToRiver}</td>;
                        })}
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 text-[#5B6472] border border-[#DEDBD1]">Monsoonal Rainfall Index</td>
                        {compareSiteIds.map(id => {
                          const s = sites.find(item => item.id === id);
                          return <td key={id} className="px-4 py-2.5 text-center border border-[#DEDBD1] text-[#3A2A12]">{s?.rainfall}</td>;
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Pipeline Monitor Simulator */}
        {activeTab === "pipeline" && (
          <div className="space-y-4">
            <div className="rounded-[8px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
              <h3 className="font-serif text-[15.5px] text-[#3A2A12] border-b border-[#DEDBD1]/60 pb-2 mb-4">AI Predictive Pipeline Status Monitor</h3>
              
              <div className="flex flex-col sm:flex-row sm:items-end gap-3 mb-6 bg-[#FAF6EB]/40 p-4 rounded-[6px] border border-[#DEDBD1]/40">
                <div className="flex-1">
                  <label htmlFor="pipelineSiteSelect" className="block text-[12px] font-semibold text-[#5B6472] mb-1">
                    Select Target Approved Site
                  </label>
                  <select
                    id="pipelineSiteSelect"
                    value={pipelineSiteId}
                    onChange={(e) => setPipelineSiteId(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3 py-1.5 text-[13px] text-[#23262B] outline-none"
                  >
                    <option value="">Select site...</option>
                    {sites.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleRunPipelineSimulation}
                  disabled={!pipelineSiteId || pipelineStep !== null}
                  className="rounded-[6px] bg-[#BB892C] px-5 py-1.5 text-[13px] font-medium text-[#F4F2ED] hover:bg-[#8F6A21] disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Run Pipeline Simulation
                </button>
              </div>

              {pipelineStep === null ? (
                <p className="text-center py-8 text-[#8A8D86] text-[13px] border border-dashed border-[#DEDBD1]/60 rounded-[6px]">
                  Select an approved site and click the button to trigger a live prediction simulation check.
                </p>
              ) : (
                <div className="space-y-4 text-[13px]">
                  <h4 className="font-bold text-[#3A2A12] uppercase tracking-wider mb-2">Simulation Pipeline Steps</h4>
                  
                  <div className="flex items-center justify-between border-b border-[#FAF6EB] pb-2">
                    <span className="font-semibold text-[#3A2A12]">Step 1: Extract Environmental Site Features</span>
                    <span className={pipelineStep >= 1 ? "text-[#2C6B33] font-bold" : "text-[#9A5A2E] italic animate-pulse"}>
                      {pipelineStep >= 1 ? "Success \u2714" : "Extracting GPS, elevation, rain indexes..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#FAF6EB] pb-2">
                    <span className="font-semibold text-[#3A2A12]">Step 2: Run Supervised AI Prediction Inference</span>
                    <span className={pipelineStep >= 2 ? "text-[#2C6B33] font-bold" : pipelineStep === 1 ? "text-[#9A5A2E] italic animate-pulse" : "text-[#8A8D86]"}>
                      {pipelineStep >= 2 ? "Success \u2714" : pipelineStep === 1 ? "Running Random Forest classifier inference..." : "Awaiting..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#FAF6EB] pb-2">
                    <span className="font-semibold text-[#3A2A12]">Step 3: Calculate Threat & Risk Score percentage</span>
                    <span className={pipelineStep >= 3 ? "text-[#2C6B33] font-bold" : pipelineStep === 2 ? "text-[#9A5A2E] italic animate-pulse" : "text-[#8A8D86]"}>
                      {pipelineStep >= 3 ? "Success \u2714" : pipelineStep === 2 ? "Aggregating feature significance and threat caps..." : "Awaiting..."}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-[#FAF6EB] pb-2">
                    <span className="font-semibold text-[#3A2A12]">Step 4: Classify Risk Level & Update GIS Spatial Map</span>
                    <span className={pipelineStep >= 4 ? "text-[#2C6B33] font-bold" : pipelineStep === 3 ? "text-[#9A5A2E] italic animate-pulse" : "text-[#8A8D86]"}>
                      {pipelineStep >= 4 ? "Success \u2714" : pipelineStep === 3 ? "Saving updates & painting marker bands..." : "Awaiting..."}
                    </span>
                  </div>

                  {pipelineOutput && (
                    <div className="bg-[#EAF3EA] border border-[#2C6B33]/20 p-4 rounded-[6px] mt-4 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-[#2C6B33] font-bold uppercase">Pipeline Output Status</span>
                        <h4 className="text-[26px] font-serif font-bold text-[#2C6B33] mt-0.5">{pipelineOutput.riskScore}% ({pipelineOutput.riskLevel} Risk)</h4>
                        <p className="text-[11px] text-[#5B6472] mt-1">Version: {pipelineOutput.modelVersion} | Confidence: {pipelineOutput.confidence}%</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPipelineStep(null);
                          setPipelineOutput(null);
                        }}
                        className="rounded-[6px] border border-[#2C6B33] text-[#2C6B33] font-semibold px-3 py-1 text-[12px] hover:bg-white"
                      >
                        Reset monitor
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function RiskBandTag({ band }: { band: string }) {
  const styles: Record<string, string> = {
    VERY_HIGH: "bg-[#F6E0DC] text-[#8A2418] border-[#8A2418]/20",
    HIGH: "bg-[#FBEBEA] text-[#B03A2E] border-[#B03A2E]/20",
    MODERATE: "bg-[#FBF0EB] text-[#9A5A2E] border-[#9A5A2E]/20",
    LOW: "bg-[#EAF3EA] text-[#2C6B33] border-[#2C6B33]/20",
  };
  const style = styles[band] || "bg-[#EFEEEA] text-[#5B6472] border-black/5";
  return (
    <span className={`inline-block rounded px-2.5 py-0.5 text-[11px] font-bold border ${style}`}>
      {band ? band.replace("_", " ") : "PENDING"}
    </span>
  );
}