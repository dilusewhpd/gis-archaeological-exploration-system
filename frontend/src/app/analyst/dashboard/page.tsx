import Link from "next/link";

/**
 * Analyst dashboard — /analyst/dashboard
 *
 * Server component: fetches summary stats, a handful of recent site
 * locations for the map preview, and recent clustering runs. Replace
 * DASHBOARD_ENDPOINT with your real API route; falls back to placeholder
 * data (matching the wireframe numbers) if the request fails.
 *
 * MAP NOTE: the "Risk zone map preview" panel is a static, dependency-free
 * thumbnail (same approach as the field officer's coordinate picker) — it
 * is NOT a real map and isn't interactive beyond linking through to the
 * full GIS map page. Swap for a real Leaflet/Mapbox render there.
 */

const DASHBOARD_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/analyst/dashboard-summary`;

type PreviewMarker = { x: number; y: number };

type ClusteringRun = {
  id: string;
  region: string;
  clusterCount: number;
};

type AnalystDashboardData = {
  totalSites: number;
  highRiskZones: number;
  clustersRun: number;
  pendingReview: number;
  previewMarkers: PreviewMarker[];
  recentRuns: ClusteringRun[];
};

const FALLBACK_DATA: AnalystDashboardData = {
  totalSites: 248,
  highRiskZones: 12,
  clustersRun: 6,
  pendingReview: 4,
  previewMarkers: [
    { x: 55, y: 32 },
    { x: 28, y: 48 },
    { x: 82, y: 24 },
    { x: 42, y: 66 },
  ],
  recentRuns: [
    { id: "run1", region: "Central Province", clusterCount: 5 },
    { id: "run2", region: "Southern Province", clusterCount: 3 },
    { id: "run3", region: "Northern Province", clusterCount: 4 },
  ],
};

async function getDashboardData(): Promise<AnalystDashboardData> {
  try {
    const res = await fetch(DASHBOARD_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return FALLBACK_DATA;
    return (await res.json()) as AnalystDashboardData;
  } catch {
    return FALLBACK_DATA;
  }
}

export default async function AnalystDashboardPage() {
  const { totalSites, highRiskZones, clustersRun, pendingReview, previewMarkers, recentRuns } =
    await getDashboardData();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">
          Analyst dashboard
        </h1>
        <Link
          href="/analyst/dashboard/profile"
          aria-label="View profile"
          className="h-8 w-8 rounded-full border border-[#DEDBD1] bg-[#F4F3EF] transition hover:border-[#16283F]/30"
        />
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Total sites" value={totalSites} />
          <StatCard label="High risk zones" value={highRiskZones} />
          <StatCard label="Clusters run" value={clustersRun} />
          <StatCard label="Pending review" value={pendingReview} />
        </div>

        {/* Map preview + recent runs */}
        <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Link
            href="/analyst/dashboard/gis-map"
            className="group block overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white"
          >
            <RiskZonePreview markers={previewMarkers} />
          </Link>

          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
            <h2 className="text-[14px] font-medium text-[#16283F]">Recent clustering runs</h2>

            <ul className="mt-3 space-y-2.5">
              {recentRuns.length === 0 ? (
                <li className="text-[13px] text-[#8A8D86]">No clustering runs yet.</li>
              ) : (
                recentRuns.map((run) => (
                  <li key={run.id} className="text-[13px] text-[#3A4048]">
                    {run.region} — {run.clusterCount} cluster{run.clusterCount === 1 ? "" : "s"}
                  </li>
                ))
              )}
            </ul>

            <Link
              href="/analyst/dashboard/risk-assessment"
              className="mt-5 flex w-full items-center justify-center rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450]"
            >
              Run new clustering
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-4">
      <p className="text-[13px] text-[#5B6472]">{label}</p>
      <p className="mt-1.5 font-serif text-[28px] leading-none text-[#16283F]">{value}</p>
    </div>
  );
}

function RiskZonePreview({ markers }: { markers: PreviewMarker[] }) {
  const gridLines = [0, 1, 2, 3, 4, 5];

  return (
    <div className="relative aspect-[16/9] w-full bg-[#F4F3EF]">
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

      {markers.map((m, i) => (
        <div
          key={i}
          className="absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9A4B2E]"
          style={{ left: `${m.x}%`, top: `${m.y}%` }}
        />
      ))}

      <p className="absolute inset-0 flex items-center justify-center text-[13px] text-[#8A8D86] transition group-hover:text-[#5B6472]">
        Risk zone map preview
      </p>
    </div>
  );
}