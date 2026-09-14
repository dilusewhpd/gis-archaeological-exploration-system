"use client";

import { useEffect, useMemo, useState } from "react";
import { apiErrorMessage, listSites, type SiteListItem } from "@/lib/sites";
import { getSiteRisk, RISK_LABEL_COLOR, type RiskLabel, type SiteRiskAssessment } from "@/lib/risk";
import { toTitleCase } from "@/lib/sri-lanka";

/**
 * Risk assessment computed on-demand per site by the Python microservice
 * (risk_service.py — a trained Random Forest classifier), not a client-side
 * mock. Sites can number in the dozens, and each assessment does a live
 * elevation lookup, so scoring happens per-row when the analyst asks for it
 * rather than upfront for the whole list.
 */

type RowState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "done"; result: SiteRiskAssessment };

export default function RiskAssessmentForm() {
  const [sites, setSites] = useState<SiteListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [rowState, setRowState] = useState<Record<string, RowState>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        // Backend caps `limit` at 100 (getSitesQuerySchema) — matches that.
        const data = await listSites({ status: "APPROVED", limit: 100 });
        if (isMounted) {
          setSites(data);
          setLoadError(null);
        }
      } catch (err) {
        if (isMounted) setLoadError(apiErrorMessage(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter(
      (s) => s.name.toLowerCase().includes(q) || s.siteCode.toLowerCase().includes(q)
    );
  }, [sites, search]);

  async function assessRisk(id: string) {
    setRowState((prev) => ({ ...prev, [id]: { status: "loading" } }));
    try {
      const result = await getSiteRisk(id);
      setRowState((prev) => ({ ...prev, [id]: { status: "done", result } }));
      setExpandedId(id);
    } catch (err) {
      setRowState((prev) => ({
        ...prev,
        [id]: { status: "error", message: apiErrorMessage(err) },
      }));
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-[#DEDBD1] bg-white p-4">
        <input
          type="text"
          placeholder="Filter by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[280px] rounded-[6px] border border-[#D4CFC3] px-3.5 py-1.5 text-[13px] outline-none focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
        />
        <p className="text-[12px] text-[#8A8D86]">
          {isLoading ? "Loading…" : `${filtered.length} of ${sites.length} approved sites`}
        </p>
      </div>

      <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="bg-[#3A2A12] text-[#F4F2ED]">
              <th className="px-4 py-2.5 font-medium">Approved site</th>
              <th className="px-4 py-2.5 font-medium">District</th>
              <th className="px-4 py-2.5 font-medium">Risk assessment</th>
              <th className="px-4 py-2.5 font-medium w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DEDBD1]/60">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#8A8D86]">
                  Loading approved sites…
                </td>
              </tr>
            ) : loadError ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#8A3A20]">
                  {loadError}
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#8A8D86]">
                  No approved sites match.
                </td>
              </tr>
            ) : (
              filtered.map((s) => {
                const state: RowState = rowState[s.id] ?? { status: "idle" };
                const isExpanded = expandedId === s.id && state.status === "done";
                return (
                  <SiteRiskRow
                    key={s.id}
                    site={s}
                    state={state}
                    isExpanded={isExpanded}
                    onAssess={() => assessRisk(s.id)}
                    onToggleExpand={() =>
                      setExpandedId((prev) => (prev === s.id ? null : s.id))
                    }
                  />
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SiteRiskRow({
  site,
  state,
  isExpanded,
  onAssess,
  onToggleExpand,
}: {
  site: SiteListItem;
  state: RowState;
  isExpanded: boolean;
  onAssess: () => void;
  onToggleExpand: () => void;
}) {
  return (
    <>
      <tr className="align-top">
        <td className="px-4 py-3">
          <p className="font-semibold text-[#3A2A12]">{site.name}</p>
          <span className="font-mono text-[10.5px] text-[#8A8D86]">{site.siteCode}</span>
        </td>
        <td className="px-4 py-3 text-[#5B6472]">{site.district}</td>
        <td className="px-4 py-3">
          <RiskCell state={state} onAssess={onAssess} />
        </td>
        <td className="px-4 py-3 text-right">
          {state.status === "done" && (
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-[11px] font-medium text-[#BB892C] hover:underline"
            >
              {isExpanded ? "Hide" : "Details"}
            </button>
          )}
        </td>
      </tr>

      {isExpanded && state.status === "done" && (
        <tr>
          <td colSpan={4} className="border-t border-[#DEDBD1]/60 bg-[#FAF6EB]/40 px-4 py-4">
            <RiskDetail result={state.result} />
          </td>
        </tr>
      )}
    </>
  );
}

function RiskCell({ state, onAssess }: { state: RowState; onAssess: () => void }) {
  if (state.status === "idle") {
    return (
      <button
        type="button"
        onClick={onAssess}
        className="rounded-[6px] bg-[#BB892C] px-3.5 py-1.5 text-[12px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21]"
      >
        Assess risk
      </button>
    );
  }

  if (state.status === "loading") {
    return <span className="text-[12px] italic text-[#8A8D86]">Assessing…</span>;
  }

  if (state.status === "error") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-[12px] text-[#8A3A20]">{state.message}</span>
        <button
          type="button"
          onClick={onAssess}
          className="text-[11.5px] font-medium text-[#BB892C] hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  const { result } = state;
  const color = RISK_LABEL_COLOR[result.risk_label];
  return (
    <div className="flex items-center gap-3">
      <RiskScoreRing score={result.risk_score} color={color} />
      <div>
        <RiskBadge label={result.risk_label} color={color} />
        <p className="mt-1 max-w-[240px] text-[10.5px] italic leading-snug text-[#8A8D86]">
          {result.model_note}
        </p>
      </div>
    </div>
  );
}

function RiskScoreRing({ score, color }: { score: number; color: string }) {
  const pct = Math.min(100, Math.max(0, score));
  return (
    <div
      className="relative h-14 w-14 shrink-0 rounded-full"
      style={{ background: `conic-gradient(${color} ${pct * 3.6}deg, #EDE9DD 0deg)` }}
    >
      <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-white text-[11.5px] font-bold" style={{ color }}>
        {score.toFixed(1)}%
      </div>
    </div>
  );
}

function RiskBadge({ label, color }: { label: RiskLabel; color: string }) {
  return (
    <span
      className="inline-block rounded px-2.5 py-0.5 text-[11px] font-bold"
      style={{ backgroundColor: `${color}1A`, color, border: `1px solid ${color}40` }}
    >
      {label} risk
    </span>
  );
}

function RiskDetail({ result }: { result: SiteRiskAssessment }) {
  const labels: RiskLabel[] = ["Low", "Medium", "High"];
  return (
    <div className="grid grid-cols-1 gap-5 text-[12px] sm:grid-cols-2">
      <div>
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#8A8D86]">
          Probability breakdown
        </span>
        <div className="space-y-1.5">
          {labels.map((l) => (
            <div key={l} className="flex items-center gap-2">
              <span className="w-14 text-[#5B6472]">{l}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#EDE9DD]">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(result.probabilities[l] * 100).toFixed(0)}%`,
                    backgroundColor: RISK_LABEL_COLOR[l],
                  }}
                />
              </div>
              <span className="w-10 text-right font-mono text-[11px] text-[#3A2A12]">
                {(result.probabilities[l] * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-[#8A8D86]">
          Inputs used
        </span>
        <div className="flex justify-between text-[#5B6472]">
          <span>Climate zone</span>
          <span className="font-medium text-[#3A2A12]">{toTitleCase(result.climate_zone)}</span>
        </div>
        <div className="flex justify-between text-[#5B6472]">
          <span>Elevation</span>
          <span className="font-medium text-[#3A2A12]">{result.elevation_m} m</span>
        </div>
        <div className="flex justify-between text-[#5B6472]">
          <span>Distance to coast</span>
          <span className="font-medium text-[#3A2A12]">{result.distance_to_coast_km} km</span>
        </div>
        <p className="mt-3 rounded-[6px] border border-[#DEDBD1] bg-white p-2.5 text-[11px] italic text-[#5B6472]">
          {result.model_note}
        </p>
      </div>
    </div>
  );
}
