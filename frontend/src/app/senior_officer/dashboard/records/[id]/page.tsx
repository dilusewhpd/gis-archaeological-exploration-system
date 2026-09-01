"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSiteById, approveSite, rejectSite, requestCorrections, type ExplorationSite } from "@/src/services/siteService";

export default function SeniorReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [site, setSite] = useState<ExplorationSite | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  // Pipeline Simulation states
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);
  const [pipelineOutput, setPipelineOutput] = useState<{ score: number; band: string } | null>(null);

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

  function runAiPipeline() {
    if (!site) return;
    const activeSite = site;
    setPipelineStep(0);
    
    // Step 0: Extract Features
    setTimeout(() => {
      setPipelineStep(1);
    }, 800);
    
    // Step 1: Run AI Prediction model
    setTimeout(() => {
      setPipelineStep(2);
    }, 1600);
    
    // Step 2: Calculate Risk Score
    setTimeout(() => {
      setPipelineStep(3);
    }, 2400);
    
    // Step 3: Classify Risk Level & Update GIS Map
    setTimeout(() => {
      setPipelineStep(4);
      // Determine what the score will be
      let score = 0;
      if (activeSite.floodZone === "High") score += 25;
      else if (activeSite.floodZone === "Medium") score += 15;
      else score += 5;
      if (activeSite.erosionIndex === "High") score += 20;
      else if (activeSite.erosionIndex === "Medium") score += 10;
      else score += 4;
      if (activeSite.encroachment === "High") score += 20;
      else if (activeSite.encroachment === "Medium") score += 10;
      else score += 3;
      if (activeSite.lootingHistory === "Yes") score += 20;
      else score += 5;
      if (activeSite.elevation < 50) score += 15;
      else if (activeSite.elevation < 150) score += 8;
      else score += 2;
      const finalScore = Math.min(100, Math.max(0, score));
      
      let band = "LOW";
      if (finalScore >= 76) band = "VERY_HIGH";
      else if (finalScore >= 51) band = "HIGH";
      else if (finalScore >= 26) band = "MODERATE";

      setPipelineOutput({ score: finalScore, band });
    }, 3200);
  }

  function handleApprove() {
    setError(null);
    runAiPipeline();
  }

  function handleReject() {
    setError(null);
    if (!comment.trim()) {
      setError("Please supply a comment explaining the rejection reasons.");
      return;
    }
    rejectSite(siteId, comment);
    router.push("/senior_officer/dashboard");
    router.refresh();
  }

  function handleNeedsCorrection() {
    setError(null);
    if (!comment.trim()) {
      setError("Please supply a comment explaining what corrections are required.");
      return;
    }
    requestCorrections(siteId, comment);
    router.push("/senior_officer/dashboard");
    router.refresh();
  }

  function handleFinishApproval() {
    approveSite(siteId, comment);
    router.push("/senior_officer/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-1 flex-col relative">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div className="flex items-center gap-2">
          <Link href="/senior_officer/dashboard" className="text-[13px] text-[#BB892C] hover:underline">
            &larr; Back to queue
          </Link>
          <span className="text-[#8A8D86] font-light">/</span>
          <span className="text-[13.5px] text-[#3A2A12] font-semibold">Review report</span>
        </div>
      </header>

      {/* Main content split */}
      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30 grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        
        {/* Left: Site Info details */}
        <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs space-y-6">
          <div className="border-b border-[#DEDBD1]/60 pb-3">
            <span className="text-[11px] text-[#8A8478] uppercase font-bold tracking-wider">Field Survey details</span>
            <h2 className="font-serif text-[22px] tracking-tight text-[#3A2A12] mt-0.5">{site.name}</h2>
            <p className="text-[12.5px] text-[#5B6472] mt-1">Visit date: {formatDate(site.visitDate)} | District: {site.district}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-[12px] font-bold text-[#3A2A12] uppercase tracking-wider">Exploration Notes</h3>
              <p className="mt-1.5 text-[13.5px] text-[#5B6472] leading-relaxed bg-[#FAF9F6] p-4 rounded-[6px] border border-[#DEDBD1]/40 whitespace-pre-line">
                {site.notes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[13px]">
              <div>
                <span className="block text-[11px] text-[#8A8D86] uppercase font-bold">GPS Coordinate</span>
                <span className="font-medium text-[#3A4048]">Lat: {site.lat}, Lng: {site.lng}</span>
              </div>
              <div>
                <span className="block text-[11px] text-[#8A8D86] uppercase font-bold">Significance level</span>
                <span className="font-semibold text-[#BB892C]">{site.significance} / 10</span>
              </div>
            </div>

            {site.supportingDoc && (
              <div>
                <span className="block text-[11px] text-[#8A8D86] uppercase font-bold mb-1.5">Supporting documents</span>
                <div className="flex items-center gap-2 rounded-[6px] border border-[#DEDBD1]/60 bg-[#FAF6EB]/20 px-3 py-2 text-[13px] text-[#5B6472] w-fit">
                  <svg className="h-4.5 w-4.5 text-[#BB892C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>{site.supportingDoc}</span>
                </div>
              </div>
            )}

            {/* Environmental variables that are evaluated by the AI */}
            <div className="border-t border-[#DEDBD1]/60 pt-4">
              <span className="block text-[11.5px] text-[#8A8D86] uppercase font-bold mb-3">Extracted Environmental Variables (AI Input Matrix)</span>
              <div className="grid grid-cols-2 gap-3.5 text-[12.5px]">
                <div className="bg-[#FAF6EB]/30 p-2.5 rounded-[6px] border border-[#DEDBD1]/30">
                  <span className="text-[#8A8D86] text-[11px] block">Terrain Elevation</span>
                  <span className="font-semibold text-[#3A2A12]">{site.elevation} meters</span>
                </div>
                <div className="bg-[#FAF6EB]/30 p-2.5 rounded-[6px] border border-[#DEDBD1]/30">
                  <span className="text-[#8A8D86] text-[11px] block">Flood Vulnerability Zone</span>
                  <span className="font-semibold text-[#3A2A12]">{site.floodZone}</span>
                </div>
                <div className="bg-[#FAF6EB]/30 p-2.5 rounded-[6px] border border-[#DEDBD1]/30">
                  <span className="text-[#8A8D86] text-[11px] block">Soil Erosion Severity</span>
                  <span className="font-semibold text-[#3A2A12]">{site.erosionIndex}</span>
                </div>
                <div className="bg-[#FAF6EB]/30 p-2.5 rounded-[6px] border border-[#DEDBD1]/30">
                  <span className="text-[#8A8D86] text-[11px] block">Urban Encroachment Danger</span>
                  <span className="font-semibold text-[#3A2A12]">{site.encroachment}</span>
                </div>
                <div className="bg-[#FAF6EB]/30 p-2.5 rounded-[6px] border border-[#DEDBD1]/30 flex-grow">
                  <span className="text-[#8A8D86] text-[11px] block">Looting Risk History</span>
                  <span className="font-semibold text-[#3A2A12]">{site.lootingHistory}</span>
                </div>
                <div className="bg-[#FAF6EB]/30 p-2.5 rounded-[6px] border border-[#DEDBD1]/30 flex-grow">
                  <span className="text-[#8A8D86] text-[11px] block">Distance to Water Margins</span>
                  <span className="font-semibold text-[#3A2A12]">{site.distanceToRiver}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Review action panel */}
        <div className="space-y-6">
          <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="font-serif text-[15.5px] text-[#3A2A12] border-b border-[#DEDBD1]/60 pb-2 mb-4">Action Panel</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="reviewComment" className="block text-[11.5px] font-bold text-[#5B6472] uppercase">
                    Review comments
                  </label>
                  <p className="text-[11px] text-[#8A8D86] mt-0.5">Required for deactivations, requests for corrections, or rejects.</p>
                  <textarea
                    id="reviewComment"
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe specific corrections needed or notes regarding approval/rejection…"
                    className="w-full resize-none rounded-[6px] border border-[#D4CFC3] mt-2 bg-white px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none placeholder:text-[#A6A199] transition focus:border-[#BB892C]"
                  />
                </div>

                {error && (
                  <div role="alert" className="rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2 text-[12.5px] text-[#8A3A20]">
                    {error}
                  </div>
                )}
              </div>
            </div>

            {site.status === "SUBMITTED" ? (
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="w-full rounded-[6px] bg-[#BB892C] py-2 text-[13.5px] font-medium text-[#F4F2ED] hover:bg-[#8F6A21] transition shadow-xs text-center"
                >
                  Approve Site & Run AI Risk Model
                </button>
                <button
                  type="button"
                  onClick={handleNeedsCorrection}
                  className="w-full rounded-[6px] border border-[#D4CFC3] py-2 text-[13.5px] font-medium text-[#5B6472] hover:bg-[#FAF6EB] transition text-center"
                >
                  Request Corrections
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="w-full rounded-[6px] border border-[#B03A2E] text-[#B03A2E] py-2 text-[13.5px] font-medium hover:bg-[#FBEBEA] transition text-center"
                >
                  Reject Site
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-[6px] bg-[#FAF6EB] p-4 text-center border border-[#BB892C]/20">
                <span className="block text-[11px] text-[#8A8D86] uppercase font-bold">Review Complete</span>
                <p className="text-[12.5px] text-[#3A2A12] mt-1">This site record is currently in <span className="font-bold">{site.status}</span> status.</p>
              </div>
            )}
          </div>

          {/* Photo Preview card */}
          {site.photoUrl && (
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-5 shadow-xs">
              <h3 className="text-[12.5px] uppercase font-bold text-[#3A2A12] tracking-wider mb-2">Photograph</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={site.photoUrl}
                alt={site.name}
                className="w-full aspect-[4/3] rounded-[6px] border border-[#DEDBD1] object-cover"
              />
            </div>
          )}
        </div>
      </main>

      {/* ---------------- PIPELINE RUN SIMULATOR POPUP ---------------- */}
      {pipelineStep !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xl text-[#3A2A12]">
            <h3 className="font-serif text-[18px] font-bold text-[#BB892C] flex items-center gap-2 border-b border-[#DEDBD1] pb-3">
              <svg className="animate-spin h-5 w-5 text-[#BB892C]" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              AI Risk-Prediction Pipeline
            </h3>

            <div className="mt-5 space-y-4 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="font-medium">1. Extract Site Features</span>
                <span className={pipelineStep >= 1 ? "text-[#2C6B33] font-bold" : "text-[#9A5A2E] italic"}>
                  {pipelineStep >= 1 ? "Complete \u2714" : "Processing..."}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="font-medium">2. Run AI Prediction</span>
                <span className={pipelineStep >= 2 ? "text-[#2C6B33] font-bold" : pipelineStep === 1 ? "text-[#9A5A2E] italic" : "text-[#8A8D86]"}>
                  {pipelineStep >= 2 ? "Complete \u2714" : pipelineStep === 1 ? "Processing..." : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">3. Calculate Risk Score</span>
                <span className={pipelineStep >= 3 ? "text-[#2C6B33] font-bold" : pipelineStep === 2 ? "text-[#9A5A2E] italic" : "text-[#8A8D86]"}>
                  {pipelineStep >= 3 ? "Complete \u2714" : pipelineStep === 2 ? "Processing..." : "Pending"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-[#DEDBD1]/60 pb-3">
                <span className="font-medium">4. Classify Risk Level & Update GIS Map</span>
                <span className={pipelineStep >= 4 ? "text-[#2C6B33] font-bold" : pipelineStep === 3 ? "text-[#9A5A2E] italic" : "text-[#8A8D86]"}>
                  {pipelineStep >= 4 ? "Complete \u2714" : pipelineStep === 3 ? "Processing..." : "Pending"}
                </span>
              </div>

              {pipelineOutput && (
                <div className="bg-[#EAF3EA] p-4 rounded-[6px] border border-[#2C6B33]/20 text-center animate-fade-in">
                  <span className="block text-[11px] text-[#2C6B33] font-bold uppercase tracking-wider">AI Classifier Results</span>
                  <h4 className="text-[32px] font-serif font-bold text-[#2C6B33] mt-1 leading-none">{pipelineOutput.score}%</h4>
                  <p className="text-[12px] text-[#2C6B33] font-semibold mt-1">Classification: {pipelineOutput.band} RISK</p>
                  <p className="text-[11px] text-[#5B6472] mt-2 leading-relaxed">The site marker has been updated in the spatial data repository and added to the active GIS map threat layer.</p>
                  
                  <button
                    type="button"
                    onClick={handleFinishApproval}
                    className="w-full mt-4 rounded-[6px] bg-[#2C6B33] py-2 text-[13.5px] font-medium text-[#F4F2ED] hover:bg-[#1E4D23] transition"
                  >
                    Finish Review & Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}
