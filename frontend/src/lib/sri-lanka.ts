/**
 * Single source of truth for Sri Lanka geography + the site taxonomy
 * enums. Imported by the site form (SiteForm), the GIS map (GisMapView),
 * and any dashboard filter that needs the same lists.
 */

// Approximate onshore bounding box (WGS84).
export const SL_BOUNDS = { latMin: 5.9, latMax: 9.9, lngMin: 79.5, lngMax: 81.9 };

/**
 * Hand-simplified outline of Sri Lanka's coastline (~38 points, WGS84),
 * traced clockwise from Point Pedro. Named landmarks keep it maintainable.
 * Used to draw the landmass on the GIS map and to reject site coordinates
 * that fall in the sea. Not a substitute for real GeoJSON — good enough to
 * read as "Sri Lanka" at dashboard scale, with the Jaffna peninsula, the
 * Mannar / Kalpitiya spurs and the Dondra taper roughly in place.
 * The <polygon>/ray-cast both auto-close, so the first point is not repeated.
 */
export const SRI_LANKA_POLYGON: { lat: number; lng: number }[] = [
  // Northern (Jaffna) peninsula → clockwise down the east coast
  { lat: 9.83, lng: 80.22 }, // Point Pedro (northern tip)
  { lat: 9.58, lng: 80.55 }, // Chundikkulam sandspit
  { lat: 9.28, lng: 80.82 }, // Mullaitivu
  { lat: 8.93, lng: 81.0 }, // Pulmoddai
  { lat: 8.57, lng: 81.24 }, // Trincomalee (Foul Point)
  { lat: 8.3, lng: 81.33 }, // Koddiyar Bay mouth
  { lat: 7.95, lng: 81.43 }, // Vakarai
  { lat: 7.72, lng: 81.7 }, // Batticaloa
  { lat: 7.3, lng: 81.84 }, // Kalmunai coast
  { lat: 6.87, lng: 81.84 }, // Pottuvil (eastern point)
  { lat: 6.55, lng: 81.63 }, // Kumana
  { lat: 6.22, lng: 81.32 }, // Kirinda
  // South coast, east → west
  { lat: 6.12, lng: 81.12 }, // Hambantota
  { lat: 6.02, lng: 80.8 }, // Tangalle
  { lat: 5.92, lng: 80.59 }, // Dondra Head (southern tip)
  { lat: 5.95, lng: 80.44 }, // Weligama
  { lat: 6.03, lng: 80.22 }, // Galle
  { lat: 6.28, lng: 80.04 }, // Ambalangoda
  // West coast, south → north
  { lat: 6.47, lng: 79.98 }, // Bentota
  { lat: 6.72, lng: 79.9 }, // Panadura / Kalutara
  { lat: 6.93, lng: 79.84 }, // Colombo
  { lat: 7.21, lng: 79.83 }, // Negombo
  { lat: 7.59, lng: 79.79 }, // Chilaw
  { lat: 7.95, lng: 79.7 }, // Udappuwa
  { lat: 8.23, lng: 79.72 }, // Kalpitiya (peninsula tip)
  { lat: 8.55, lng: 79.66 }, // Kalpitiya west coast
  { lat: 8.78, lng: 79.71 }, // Kudiramalai Point
  { lat: 8.95, lng: 79.85 }, // Arippu / Vankalai
  { lat: 9.05, lng: 79.69 }, // Talaimannar (Mannar Island, west tip)
  { lat: 9.13, lng: 79.92 }, // Mannar Island (north side)
  { lat: 9.32, lng: 80.0 }, // Vidattaltivu coast
  { lat: 9.55, lng: 80.08 }, // Pooneryn (west)
  { lat: 9.63, lng: 80.28 }, // Pooneryn (north)
  { lat: 9.5, lng: 80.4 }, // Elephant Pass (isthmus neck)
  { lat: 9.61, lng: 80.16 }, // Chavakachcheri (peninsula, south coast)
  { lat: 9.61, lng: 79.92 }, // Jaffna / Ariyalai (peninsula, south coast)
  { lat: 9.68, lng: 79.78 }, // Kayts / Velanai (peninsula, west end)
  { lat: 9.83, lng: 80.03 }, // Kankesanthurai (peninsula, north coast)
];

export function isPointInPolygon(
  lat: number,
  lng: number,
  polygon: { lat: number; lng: number }[] = SRI_LANKA_POLYGON
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

/** Project a lat/lng to {x,y} percentages inside the SL_BOUNDS box. */
export function projectToPercent(lat: number, lng: number): { xPct: number; yPct: number } {
  return {
    xPct: ((lng - SL_BOUNDS.lngMin) / (SL_BOUNDS.lngMax - SL_BOUNDS.lngMin)) * 100,
    yPct: ((SL_BOUNDS.latMax - lat) / (SL_BOUNDS.latMax - SL_BOUNDS.latMin)) * 100,
  };
}

/** Inverse of projectToPercent — screen ratios (0..1) back to lat/lng. */
export function unprojectRatio(xRatio: number, yRatio: number): { lat: number; lng: number } {
  return {
    lng: SL_BOUNDS.lngMin + xRatio * (SL_BOUNDS.lngMax - SL_BOUNDS.lngMin),
    lat: SL_BOUNDS.latMax - yRatio * (SL_BOUNDS.latMax - SL_BOUNDS.latMin),
  };
}

export const PROVINCES = [
  "Central", "Eastern", "North Central", "Northern", "North Western",
  "Sabaragamuwa", "Southern", "Uva", "Western",
] as const;

export const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
] as const;

// Exact prisma enum values — do NOT edit the strings.
export const HISTORICAL_PERIODS = [
  "PREHISTORIC", "PROTOHISTORIC", "ANURADHAPURA", "POLONNARUWA", "DAMBADENIYA",
  "YAPAHUWA", "KURUNEGALA", "GAMPOLA", "KOTTE", "KANDYAN", "COLONIAL", "MODERN",
] as const;

export const SITE_TYPES = [
  "TEMPLE", "STUPA", "MONASTERY", "FORTRESS", "PALACE", "CAVE", "CEMETERY",
  "INSCRIPTION", "RESERVOIR", "MONUMENT", "SETTLEMENT", "OTHER",
] as const;

/** "KANDYAN" -> "Kandyan", "NORTH_CENTRAL" -> "North Central". */
export function toTitleCase(v: string): string {
  return v
    ? v.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
}
