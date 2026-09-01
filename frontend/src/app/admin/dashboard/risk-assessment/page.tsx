import RiskAssessmentForm from "../../../analyst/dashboard/risk-assessment/RiskAssessmentForm";

/**
 * Admin AI Risk assessment — /admin/dashboard/risk-assessment
 */
export default function AdminRiskAssessmentPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">
          AI Risk assessment
        </h1>
        <p className="mt-0.5 text-[13px] text-[#5B6472]">
          Monitor the automatic AI predictive risk pipeline, compare site attributes, and review vulnerability scores.
        </p>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <RiskAssessmentForm />
      </main>
    </div>
  );
}
