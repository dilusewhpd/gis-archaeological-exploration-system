import GisMapView, { type MapSite } from "./GisMapView";

/**
 * GIS map — /analyst/dashboard/gis-map
 *
 * Covers: "View archaeological site on the GIS map" (<<extends>> Zoom and
 * navigate), "Search for exploration sites", "Filter site on map", and
 * "View the site details" (<<include>> View the site photograph).
 *
 * Does NOT cover "Manage GIS layer" — that's layer CRUD (create/edit a
 * gis_layers row: source, style, active flag) and belongs on its own
 * admin-facing page, not the toggles here (those just show/hide the
 * built-in layers below).
 *
 * MAP NOTE: same as the other map surfaces in this app — this renders
 * sites on a dependency-free grid scaled to Sri Lanka's onshore bounding
 * box rather than real map tiles, to avoid taking on an unverified
 * Leaflet/Mapbox dependency. Swap <GisMapView /> internals for a real
 * tiled map when that's ready; it already receives plain { lat, lng }.
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

export default async function GisMapPage() {
  const sites = await getSites();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">GIS map</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        <GisMapView sites={sites} />
      </main>
    </div>
  );
}