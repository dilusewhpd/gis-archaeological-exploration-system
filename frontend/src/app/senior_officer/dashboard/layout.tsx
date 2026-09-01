import Sidebar from "@/src/components/dashboard/Sidebar";
import type { ReactNode } from "react";

/**
 * Senior Officer dashboard layout — /senior_officer/dashboard/*
 * Department of Archaeology, Sri Lanka
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-[#F0E6C8] flex-col lg:flex-row">
      <Sidebar role="senior_officer" />
      <div className="flex flex-1 flex-col min-w-0">{children}</div>
    </div>
  );
}
