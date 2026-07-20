import RiskAssessmentForm, { type Dataset } from "./RiskAssessmentForm";

/**
 * Risk assessment — /analyst/dashboard/risk-assessment
 *
 * Covers the full chain from the use case diagram:
 *   Select approved dataset -> Configure parameters -> Run K-Means ->
 *   Analyze site density -> Generate risk zone -> View risk analysis
 *   result (<<extends>> Generate risk assessment report,
 *   View risk zone on GIS map).
 *
 * Server component fetches the list of approved datasets an analyst can
 * choose from; the interactive clustering form/results live in a client
 * child component.
 */

const DATASETS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/risk-assessment/datasets`;

const FALLBACK_DATASETS: Dataset[] = [
  { id: "d1", name: "All approved sites — island-wide", siteCount: 214 },
  { id: "d2", name: "Central Province — approved", siteCount: 58 },
  { id: "d3", name: "North Central Province — approved", siteCount: 71 },
  { id: "d4", name: "Southern Province — approved", siteCount: 39 },
];

async function getDatasets(): Promise<Dataset[]> {
  try {
    const res = await fetch(DATASETS_ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error("request failed");
    return (await res.json()) as Dataset[];
  } catch {
    return FALLBACK_DATASETS;
  }
}

export default async function RiskAssessmentPage() {
  const datasets = await getDatasets();

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">
          Risk assessment
        </h1>
        <p className="mt-0.5 text-[13px] text-[#5B6472]">
          Run K-Means clustering on approved sites to identify high-risk zones.
        </p>
      </header>

      <main className="flex-1 px-8 py-7">
        <RiskAssessmentForm datasets={datasets} />
      </main>
    </div>
  );
}