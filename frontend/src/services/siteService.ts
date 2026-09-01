export type RecordStatus = "DRAFT" | "SUBMITTED" | "APPROVED" | "REJECTED" | "NEEDS_CORRECTION";
export type RiskBand = "LOW" | "MODERATE" | "HIGH" | "VERY_HIGH";

export interface ExplorationSite {
  id: string;
  name: string;
  district: string;
  visitDate: string;
  status: RecordStatus;
  notes: string;
  lat: number;
  lng: number;
  photoUrl: string | null;
  supportingDoc: string | null;
  reviewComments: string | null;
  riskScore: number | null;
  riskBand: RiskBand | null;
  
  // Contributing attributes for AI Risk Score display
  elevation: number;
  floodZone: "High" | "Medium" | "Low";
  erosionIndex: "High" | "Medium" | "Low";
  encroachment: "High" | "Medium" | "Low";
  lootingHistory: "Yes" | "No";
  significance: number; // 1-10
  distanceToRiver: string;
  rainfall: string;
  landUse: string;
  proximityDevelopment: string;
}

const DEFAULT_SITES: ExplorationSite[] = [
  {
    id: "s1",
    name: "Anuradhapura North Ruins",
    district: "Anuradhapura",
    visitDate: "2026-07-01",
    status: "APPROVED",
    notes: "Ancient temple ruins in the Anuradhapura North sector. Found evidence of structural cracking on main masonry vault.",
    lat: 8.450,
    lng: 80.420,
    photoUrl: "/images/sigiriya.jpg", // placeholder if any
    supportingDoc: "survey_notes_anuradhapura_n.pdf",
    reviewComments: null,
    riskScore: 82,
    riskBand: "VERY_HIGH",
    elevation: 12,
    floodZone: "High",
    erosionIndex: "High",
    encroachment: "High",
    lootingHistory: "Yes",
    significance: 9,
    distanceToRiver: "0.2 km (Malwathu Oya)",
    rainfall: "1,450 mm/year",
    landUse: "Protected Archeological Zone",
    proximityDevelopment: "High (0.45 km from settlement boundary)",
  },
  {
    id: "s2",
    name: "Sigiriya East Ridge Walls",
    district: "Matale",
    visitDate: "2026-07-05",
    status: "APPROVED",
    notes: "Stone walls along the eastern ridge of Sigiriya complex. Minor rock slide damage detected near terrace 3.",
    lat: 7.960,
    lng: 80.770,
    photoUrl: null,
    supportingDoc: "east_ridge_walls_condition.pdf",
    reviewComments: "Approved following remote review of high-res drone captures.",
    riskScore: 68,
    riskBand: "HIGH",
    elevation: 180,
    floodZone: "Low",
    erosionIndex: "High",
    encroachment: "High",
    lootingHistory: "No",
    significance: 10,
    distanceToRiver: "2.4 km",
    rainfall: "1,800 mm/year",
    landUse: "UNESCO Forest Reserve",
    proximityDevelopment: "High (0.12 km from highway project)",
  },
  {
    id: "s3",
    name: "Polonnaruwa Canal Site",
    district: "Polonnaruwa",
    visitDate: "2026-07-09",
    status: "SUBMITTED",
    notes: "Excavation site along ancient Parakrama Samudra canal system. High soil moisture threatening earthen wall structures.",
    lat: 7.940,
    lng: 81.000,
    photoUrl: null,
    supportingDoc: null,
    reviewComments: null,
    riskScore: null,
    riskBand: null,
    elevation: 35,
    floodZone: "High",
    erosionIndex: "Medium",
    encroachment: "Medium",
    lootingHistory: "Yes",
    significance: 8,
    distanceToRiver: "0.05 km (Canal margin)",
    rainfall: "1,650 mm/year",
    landUse: "Agricultural buffer zone",
    proximityDevelopment: "Medium (1.5 km)",
  },
  {
    id: "s4",
    name: "Yapahuwa Terrace Wall",
    district: "Kurunegala",
    visitDate: "2026-07-11",
    status: "NEEDS_CORRECTION",
    notes: "South terrace retaining wall alignment. Retaining structure appears stable but needs physical measurement data.",
    lat: 7.830,
    lng: 80.320,
    photoUrl: null,
    supportingDoc: null,
    reviewComments: "Please add GPS coordinates and physical measurement details for the secondary excavation trench.",
    riskScore: null,
    riskBand: null,
    elevation: 95,
    floodZone: "Medium",
    erosionIndex: "Medium",
    encroachment: "Low",
    lootingHistory: "No",
    significance: 7,
    distanceToRiver: "3.1 km",
    rainfall: "2,100 mm/year",
    landUse: "Protected Sanctuary",
    proximityDevelopment: "Low (3.5 km)",
  },
  {
    id: "s5",
    name: "Ritigala Forest Shrine",
    district: "Anuradhapura",
    visitDate: "2026-07-13",
    status: "APPROVED",
    notes: "Partially buried stone shrine inside the Ritigala strict nature reserve. Pristine condition, minimal threats.",
    lat: 8.100,
    lng: 80.650,
    photoUrl: null,
    supportingDoc: "ritigala_survey_july.pdf",
    reviewComments: null,
    riskScore: 18,
    riskBand: "LOW",
    elevation: 220,
    floodZone: "Low",
    erosionIndex: "Low",
    encroachment: "Low",
    lootingHistory: "No",
    significance: 9,
    distanceToRiver: "5.5 km",
    rainfall: "1,350 mm/year",
    landUse: "Strict Nature Reserve",
    proximityDevelopment: "Low (8.0 km)",
  },
  {
    id: "s6",
    name: "Galle Fort Perimeter",
    district: "Galle",
    visitDate: "2026-06-20",
    status: "APPROVED",
    notes: "Sea-wall erosion survey. Wave impact damage near the southwest bastion.",
    lat: 6.030,
    lng: 80.220,
    photoUrl: null,
    supportingDoc: null,
    reviewComments: null,
    riskScore: 45,
    riskBand: "MODERATE",
    elevation: 3,
    floodZone: "High",
    erosionIndex: "High",
    encroachment: "Medium",
    lootingHistory: "No",
    significance: 9,
    distanceToRiver: "0.01 km (Indian Ocean)",
    rainfall: "2,350 mm/year",
    landUse: "Urban Conservation Area",
    proximityDevelopment: "High (0.01 km)",
  }
];

export function getSites(): ExplorationSite[] {
  if (typeof window === "undefined") return DEFAULT_SITES;
  
  const saved = localStorage.getItem("archaeological_sites");
  if (!saved) {
    localStorage.setItem("archaeological_sites", JSON.stringify(DEFAULT_SITES));
    return DEFAULT_SITES;
  }
  return JSON.parse(saved);
}

export function saveSites(sites: ExplorationSite[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem("archaeological_sites", JSON.stringify(sites));
  }
}

export function getSiteById(id: string): ExplorationSite | null {
  const sites = getSites();
  return sites.find(s => s.id === id) || null;
}

export function saveSite(site: ExplorationSite) {
  const sites = getSites();
  const index = sites.findIndex(s => s.id === site.id);
  if (index !== -1) {
    sites[index] = site;
  } else {
    sites.push(site);
  }
  saveSites(sites);
}

export function calculateRiskScore(site: ExplorationSite) {
  let score = 0;
  
  // 1. Flood zone threat (max 25 pts)
  if (site.floodZone === "High") score += 25;
  else if (site.floodZone === "Medium") score += 15;
  else score += 5;
  
  // 2. Erosion index threat (max 20 pts)
  if (site.erosionIndex === "High") score += 20;
  else if (site.erosionIndex === "Medium") score += 10;
  else score += 4;
  
  // 3. Urban encroachment threat (max 20 pts)
  if (site.encroachment === "High") score += 20;
  else if (site.encroachment === "Medium") score += 10;
  else score += 3;
  
  // 4. Looting history threat (max 20 pts)
  if (site.lootingHistory === "Yes") score += 20;
  else score += 5;
  
  // 5. Elevation risk mapping (max 15 pts)
  if (site.elevation < 50) score += 15;
  else if (site.elevation < 150) score += 8;
  else score += 2;
  
  const finalScore = Math.min(100, Math.max(0, score));
  
  // Classify Risk Level derived from 0-100% score:
  // Low (0–25%), Moderate (26–50%), High (51–75%), Very High (76–100%)
  let band: RiskBand = "LOW";
  if (finalScore >= 76) band = "VERY_HIGH";
  else if (finalScore >= 51) band = "HIGH";
  else if (finalScore >= 26) band = "MODERATE";
  
  site.riskScore = finalScore;
  site.riskBand = band;
}

export function approveSite(id: string, comment: string | null) {
  const sites = getSites();
  const site = sites.find(s => s.id === id);
  if (site) {
    site.status = "APPROVED";
    site.reviewComments = comment;
    calculateRiskScore(site); // Trigger automatic AI prediction pipeline
    saveSites(sites);
  }
}

export function rejectSite(id: string, comment: string | null) {
  const sites = getSites();
  const site = sites.find(s => s.id === id);
  if (site) {
    site.status = "REJECTED";
    site.reviewComments = comment;
    site.riskScore = null;
    site.riskBand = null;
    saveSites(sites);
  }
}

export function requestCorrections(id: string, comment: string | null) {
  const sites = getSites();
  const site = sites.find(s => s.id === id);
  if (site) {
    site.status = "NEEDS_CORRECTION";
    site.reviewComments = comment;
    site.riskScore = null;
    site.riskBand = null;
    saveSites(sites);
  }
}

export function deleteSite(id: string) {
  const sites = getSites();
  const filtered = sites.filter(s => s.id !== id);
  saveSites(filtered);
}
