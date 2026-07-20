import GisMapView, { type MapSite } from "../../../analyst/dashboard/gis-map/GisMapView";

/**
 * GIS map — /admin/dashboard/gis-map
 *
 * Reuses the GisMapView component to display archaeological site locations
 * on the GIS coordinates grid for the Administrator view.
 */

const SITES_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/gis/sites`;

const FALLBACK_SITES: MapSite[] = [
  { id: "s1", name: "Anuradhapura North", district: "Anuradhapura", siteType: "Temple ruins", historicalPeriod: "Anuradhapura period", status: "active", riskLevel: "high", lat: 8.45, lng: 80.42, photoUrl: null },
  { id: "s2", name: "Sigiriya East ridge", district: "Matale", siteType: "Rock fortress", historicalPeriod: "5th century CE", status: "monitoring", riskLevel: "high", lat: 7.96, lng: 80.77, photoUrl: null },
  { id: "s3", name: "Polonnaruwa canal site", district: "Polonnaruwa", siteType: "Irrigation works", historicalPeriod: "Polonnaruwa period", status: "monitoring", riskLevel: "medium", lat: 7.94, lng: 81.00, photoUrl: null },
  { id: "s4", name: "Yapahuwa terrace", district: "Kurunegala", siteType: "Rock fortress", historicalPeriod: "13th century CE", status: "active", riskLevel: "low", lat: 7.83, lng: 80.32, photoUrl: null },
  { id: "s5", name: "Ritigala west slope", district: "Anuradhapura", siteType: "Monastery ruins", historicalPeriod: "Anuradhapura period", status: "at_risk", riskLevel: "critical", lat: 8.10, lng: 80.65, photoUrl: null },
  { id: "s6", name: "Jaffna fort outskirts", district: "Jaffna", siteType: "Colonial fort", historicalPeriod: "17th century CE", status: "active", riskLevel: "low", lat: 9.66, lng: 80.02, photoUrl: null },
  { id: "s7", name: "Kataragama shrine grounds", district: "Monaragala", siteType: "Shrine complex", historicalPeriod: "Multiple periods", status: "archived", riskLevel: "low", lat: 6.42, lng: 81.34, photoUrl: null },
  { id: "s8", name: "Galle fort perimeter", district: "Galle", siteType: "Colonial fort", historicalPeriod: "16th–18th century CE", status: "monitoring", riskLevel: "medium", lat: 6.03, lng: 80.22, photoUrl: null },
];

async function getSites(): Promise<MapSite[]> {
  try {
    const res = await fetch(SITES_ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error("request failed");
    return (await res.json()) as MapSite[];
  } catch {
    return FALLBACK_SITES;
  }
}

export default async function AdminGisMapPage() {
  const sites = await getSites();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#16283F]">
            GIS Map
          </h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            National spatial database and site layer monitoring
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 py-7 lg:px-9 bg-[#F4F3EF]">
        <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-5">
          <GisMapView sites={sites} />
        </div>
      </main>
    </div>
  );
}
