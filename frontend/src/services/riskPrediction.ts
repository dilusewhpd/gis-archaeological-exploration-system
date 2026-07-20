export type HazardFeatures = {
  elevation: boolean;
  floodZone: boolean;
  erosionIndex: boolean;
  urbanEncroachment: boolean;
  lootingHistory: boolean;
  rainfall: boolean;
};

export type SiteDetails = {
  elevation: number;
  floodZone: string;
  erosionIndex: string;
  encroachment: string;
  lootingHistory: string;
  significance: number;
};

export type PredictionResult = {
  riskLevel: "Critical" | "High" | "Medium" | "Low";
  confidence: number;
  modelVersion: string;
  featureImportance: { feature: string; weight: number }[];
};

/**
 * Supervised classifier simulation (synthetic model)
 */
export function predictRisk(features: HazardFeatures, site: SiteDetails): PredictionResult {
  let score = 0;
  let activeIndicatorsCount = 0;

  // Track triggered hazards
  const triggered: Record<string, number> = {};

  if (features.elevation) {
    activeIndicatorsCount++;
    if (site.elevation < 50) {
      triggered["Elevation"] = 25;
      score += 25;
    } else {
      triggered["Elevation"] = 5;
    }
  }

  if (features.floodZone) {
    activeIndicatorsCount++;
    if (site.floodZone === "High") {
      triggered["Flood Vulnerability"] = 35;
      score += 35;
    } else if (site.floodZone === "Medium") {
      triggered["Flood Vulnerability"] = 20;
      score += 20;
    } else {
      triggered["Flood Vulnerability"] = 5;
    }
  }

  if (features.erosionIndex) {
    activeIndicatorsCount++;
    if (site.erosionIndex === "High") {
      triggered["Soil Erosion"] = 20;
      score += 20;
    } else if (site.erosionIndex === "Medium") {
      triggered["Soil Erosion"] = 10;
      score += 10;
    } else {
      triggered["Soil Erosion"] = 2;
    }
  }

  if (features.urbanEncroachment) {
    activeIndicatorsCount++;
    if (site.encroachment === "High") {
      triggered["Urban Encroachment"] = 20;
      score += 20;
    } else if (site.encroachment === "Medium") {
      triggered["Urban Encroachment"] = 10;
      score += 10;
    } else {
      triggered["Urban Encroachment"] = 2;
    }
  }

  if (features.lootingHistory) {
    activeIndicatorsCount++;
    if (site.lootingHistory === "Yes") {
      triggered["Looting Risk"] = 30;
      score += 30;
    } else {
      triggered["Looting Risk"] = 5;
    }
  }

  if (features.rainfall) {
    activeIndicatorsCount++;
    triggered["Monsoonal Rainfall"] = 15;
    score += 15;
  }

  // Calculate prediction risk level classification
  let riskLevel: "Critical" | "High" | "Medium" | "Low" = "Low";
  if (score >= 70) {
    riskLevel = "Critical";
  } else if (score >= 45) {
    riskLevel = "High";
  } else if (score >= 20) {
    riskLevel = "Medium";
  } else {
    riskLevel = "Low";
  }

  // Calculate simulated model confidence based on matching features count and severity
  let confidence = 65;
  if (activeIndicatorsCount > 0) {
    const rawConf = 60 + (score / (activeIndicatorsCount * 30)) * 37;
    confidence = Math.min(97, Math.max(60, Math.round(rawConf)));
  }

  // Compute percentage contributions for feature importance mini graph
  const totalImportancePoints = Object.values(triggered).reduce((a, b) => a + b, 0) || 1;
  const featureImportance = Object.entries(triggered).map(([key, val]) => ({
    feature: key,
    weight: Math.round((val / totalImportancePoints) * 100),
  }));

  // Sort feature importance descending
  featureImportance.sort((a, b) => b.weight - a.weight);

  return {
    riskLevel,
    confidence,
    modelVersion: "synthetic-v1",
    featureImportance,
  };
}
