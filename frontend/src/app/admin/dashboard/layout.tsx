import Sidebar from "@/src/components/dashboard/Sidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import type { ReactNode } from "react";

/**
 * Admin dashboard layout — /admin/dashboard/*
 * Department of Archaeology, Sri Lanka
 *
 * Wraps all pages under this route with the shared responsive Sidebar.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute allowedRoles={["ADMIN"]}>
      <div className="flex min-h-screen bg-[#F0E6C8] flex-col lg:flex-row">
        <Sidebar role="admin" />
        <div className="flex flex-1 flex-col min-w-0">{children}</div>
      </div>
    </ProtectedRoute>
  );
}