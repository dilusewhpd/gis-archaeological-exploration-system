import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon?: ReactNode;
  colorClass?: string; // e.g., "text-[#16283F]" or "text-[#BB892C]"
}

export default function StatCard({
  label,
  value,
  detail,
  icon,
  colorClass = "text-[#16283F]",
}: StatCardProps) {
  return (
    <div className="group relative flex items-center justify-between overflow-hidden rounded-[10px] border border-[#DEDBD1] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BB892C]/30 hover:shadow-md">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[#FAF6EB]/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col">
        <span className="text-[13px] font-medium text-[#8A8478] tracking-tight">{label}</span>
        <span className={`mt-2 font-serif text-[28px] leading-none font-bold ${colorClass}`}>
          {value}
        </span>
        {detail && <span className="mt-1.5 text-[11px] text-[#A6A199]">{detail}</span>}
      </div>

      {icon && (
        <div className={`relative z-10 grid h-12 w-12 place-items-center rounded-full bg-[#FAF6EB] text-[#BB892C]/80 transition-colors duration-300 group-hover:bg-[#BB892C]/10 group-hover:text-[#BB892C] shrink-0 ml-3`}>
          {icon}
        </div>
      )}
    </div>
  );
}
