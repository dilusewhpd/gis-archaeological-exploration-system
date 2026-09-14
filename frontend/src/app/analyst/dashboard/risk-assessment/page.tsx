import RiskAssessmentForm from "./RiskAssessmentForm";

/**
 * Risk assessment — /analyst/dashboard/risk-assessment
 */

export default async function RiskAssessmentPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">
          Risk assessment
        </h1>
        <p className="mt-0.5 text-[13px] text-[#5B6472]">
          Exposure risk for approved sites, scored by a trained Random Forest classifier — a heuristic indicator, not a verified damage prediction.
        </p>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <RiskAssessmentForm />
      </main>
    </div>
  );
}