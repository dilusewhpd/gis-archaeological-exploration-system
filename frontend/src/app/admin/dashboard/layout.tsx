"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Shared shell for the Admin section: sidebar nav + wraps every page
 * under /admin/dashboard (dashboard, users, reports, decisions, profile).
 *
 * Role guard note: assumes middleware/auth already restricted access to
 * role = "admin" before reaching here.
 */

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/dashboard/users", label: "Users" },
  { href: "/admin/dashboard/reports", label: "Reports" },
  { href: "/admin/dashboard/decisions", label: "Decisions" },
  { href: "/admin/dashboard/profile", label: "Profile" },
];

export default function AdminDashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-[#F4F3EF]">
      <aside className="flex w-56 shrink-0 flex-col border-r border-[#DEDBD1] bg-white">
        <div className="flex items-center gap-2.5 border-b border-[#DEDBD1] px-5 py-4">
          <EmblemMark />
          <span className="text-[13px] font-medium tracking-wide text-[#16283F]">
            GIS Archaeology
          </span>
        </div>

        <nav className="flex-1 px-2.5 py-4">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin/dashboard"
                  ? pathname === "/admin/dashboard"
                  : pathname.startsWith(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      "block rounded-[6px] px-3 py-2 text-[13px] transition " +
                      (isActive
                        ? "bg-[#16283F] font-medium text-[#F4F2ED]"
                        : "text-[#5B6472] hover:bg-[#F4F3EF] hover:text-[#16283F]")
                    }
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-[#DEDBD1] px-3 py-3">
          <p className="px-2 text-[11px] text-[#8A8D86]">Department of Archaeology</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}

function EmblemMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="15" r="13.5" fill="none" stroke="#16283F" strokeWidth="1.6" />
      <path
        d="M15 8 L20.5 12.2 V19.5 H9.5 V12.2 Z"
        fill="none"
        stroke="#16283F"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="15.5" r="1.7" fill="#16283F" />
    </svg>
  );
}