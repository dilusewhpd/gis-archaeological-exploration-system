import Link from "next/link";
import type { ReactNode } from "react";

interface QuickLinkCardProps {
  href: string;
  title: string;
  description: string;
  icon: ReactNode;
  theme?: "warm" | "cool";
}

export default function QuickLinkCard({
  href,
  title,
  description,
  icon,
  theme = "cool",
}: QuickLinkCardProps) {
  const accentBg = theme === "warm" ? "group-hover:bg-[#BB892C]/10" : "group-hover:bg-[#16283F]/10";
  const accentText = theme === "warm" ? "text-[#BB892C] group-hover:text-[#8F6A21]" : "text-[#16283F] group-hover:text-[#1D3450]";
  const arrowColor = theme === "warm" ? "text-[#BB892C]" : "text-[#16283F]";

  return (
    <Link
      href={href}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[10px] border border-[#DEDBD1] bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-[#BB892C]/20 hover:shadow-md"
    >
      {/* Sleek top-right hover light */}
      <div className={`absolute -right-8 -top-8 h-20 w-20 rounded-full transition-all duration-500 opacity-20 pointer-events-none ${
        theme === "warm" ? "bg-[#BB892C] group-hover:scale-150" : "bg-[#16283F] group-hover:scale-150"
      }`} />

      <div>
        {/* Icon Header */}
        <div className={`grid h-10 w-10 place-items-center rounded-lg bg-[#F4F3EF] text-[#5B6472] transition-colors duration-300 ${accentBg} ${accentText} shrink-0`}>
          {icon}
        </div>

        {/* Text */}
        <h3 className="mt-4 font-serif text-[15px] font-semibold text-[#3A2A12] leading-snug">
          {title}
        </h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-[#8A8478]">
          {description}
        </p>
      </div>

      {/* Action footer */}
      <div className="mt-5 flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-[#A6A199] group-hover:text-[#5B6472] transition-colors">
        <span>Open</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`translate-x-0 transition-transform duration-300 group-hover:translate-x-1 ${arrowColor}`}
        >
          <line x1="5" y1="12" x2="19" y2="12" />
          <polyline points="12 5 19 12 12 19" />
        </svg>
      </div>
    </Link>
  );
}
