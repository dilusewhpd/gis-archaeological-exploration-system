"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type RoleType = "field_officer" | "analyst" | "admin";

interface SidebarProps {
  role: RoleType;
}

const ROLE_CONFIGS = {
  field_officer: {
    theme: "warm" as const,
    brandTitle: "Exploration Data",
    brandSubtitle: "Management System",
    deptTitle: "Department of Archaeology",
    navItems: [
      { href: "/field_officer/dashboard", label: "Dashboard", icon: "home" },
      { href: "/field_officer/dashboard/new-site", label: "Register site", icon: "plus-circle" },
      { href: "/field_officer/dashboard/records", label: "My sites", icon: "map-pin" },
      { href: "/field_officer/dashboard/reports", label: "Reports", icon: "doc" },
      { href: "/field_officer/dashboard/profile", label: "Settings", icon: "gear" },
    ],
  },
  analyst: {
    theme: "warm" as const,
    brandTitle: "GIS Archaeology",
    brandSubtitle: "Analysis Portal",
    deptTitle: "Department of Archaeology",
    navItems: [
      { href: "/analyst/dashboard", label: "Dashboard", icon: "home" },
      { href: "/analyst/dashboard/gis-map", label: "GIS map", icon: "map" },
      { href: "/analyst/dashboard/risk-assessment", label: "Risk assessment", icon: "shield-check" },
      { href: "/analyst/dashboard/reports", label: "Reports", icon: "doc" },
      { href: "/analyst/dashboard/profile", label: "Profile", icon: "gear" },
    ],
  },
  admin: {
    theme: "warm" as const,
    brandTitle: "GIS Archaeology",
    brandSubtitle: "Admin Control",
    deptTitle: "Department of Archaeology",
    navItems: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "home" },
      { href: "/admin/dashboard/users", label: "Users", icon: "users" },
      { href: "/admin/dashboard/reports", label: "Reports", icon: "doc" },
      { href: "/admin/dashboard/decisions", label: "Decisions", icon: "shield-check" },
      { href: "/admin/dashboard/profile", label: "Profile", icon: "gear" },
    ],
  },
};

const THEMES = {
  warm: {
    aside: "bg-[#241708] text-[#C9BFA8]",
    toggleBtn: "border-[#DEDBD1] bg-white text-[#8A8478] hover:border-[#BB892C]/50 hover:text-[#BB892C]",
    brandTitle: "text-[#F4F2ED]",
    brandSubtitle: "text-[#FAC437]",
    navActive: "bg-[#3A2A12] text-[#FAC437]",
    navInactive: "text-[#C9BFA8] hover:bg-[#2E2110] hover:text-[#F4F2ED]",
    tooltip: "bg-[#3A2A12] text-[#F4F2ED]",
    bottomCard: "border-[#4A3820] bg-[#2E2110] text-[#B7AC94]",
    bottomCardTitle: "text-[#C9A15C]",
    deptFooter: "text-[#8A8478]",
  },
  cool: {
    aside: "bg-white border-r border-[#DEDBD1] text-[#5B6472]",
    toggleBtn: "border-[#DEDBD1] bg-white text-[#8A8478] hover:border-[#16283F]/50 hover:text-[#16283F]",
    brandTitle: "text-[#16283F]",
    brandSubtitle: "text-[#5B6472]",
    navActive: "bg-[#16283F] font-medium text-[#F4F2ED]",
    navInactive: "text-[#5B6472] hover:bg-[#F4F3EF] hover:text-[#16283F]",
    tooltip: "bg-[#16283F] text-[#F4F2ED]",
    bottomCard: "border-[#DEDBD1] bg-[#F4F3EF] text-[#5B6472]",
    bottomCardTitle: "text-[#16283F]",
    deptFooter: "text-[#8A8D86]",
  },
};

const MOBILE_HEADER_THEMES = {
  warm: "bg-[#241708] border-[#3A2A12] text-[#F4F2ED]",
  cool: "bg-[#16283F] border-[#1D3450] text-[#F4F2ED]",
};

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const config = ROLE_CONFIGS[role];
  const theme = THEMES[config.theme];
  const mobileHeaderClass = MOBILE_HEADER_THEMES[config.theme];

  return (
    <>
      {/* ---------------- MOBILE TOP BAR ---------------- */}
      <header
        className={`flex h-14 w-full items-center justify-between border-b px-4 lg:hidden ${mobileHeaderClass}`}
      >
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="rounded p-1.5 hover:bg-white/10 active:bg-white/20 focus:outline-none"
          >
            <MenuIcon />
          </button>
          <span className="font-serif text-[15px] font-medium tracking-tight">
            {config.brandTitle}
          </span>
        </div>
        <div className="text-[10px] uppercase tracking-wider opacity-85">
          {role.replace("_", " ")}
        </div>
      </header>

      {/* ---------------- MOBILE DRAWER BACKDROP ---------------- */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ---------------- MOBILE DRAWER CONTENT ---------------- */}
      <aside
        className={`fixed bottom-0 top-0 left-0 z-50 flex w-[240px] flex-col transition-transform duration-300 ease-in-out lg:hidden ${
          theme.aside
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {config.theme === "warm" && <SurveyGraticule />}

        {/* Brand */}
        <div className="flex items-center justify-between px-6 pb-6 pt-7 border-b border-[#DEDBD1]/20">
          <div>
            <p className={`font-serif text-[16px] leading-tight ${theme.brandTitle}`}>
              {config.brandTitle}
              <br />
              {config.brandSubtitle}
            </p>
            <p className={`mt-1.5 text-[8px] font-medium uppercase tracking-[0.18em] ${theme.brandSubtitle}`}>
              {config.deptTitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation menu"
            className="rounded p-1.5 hover:bg-white/10 active:bg-white/20 focus:outline-none"
          >
            <XIcon />
          </button>
        </div>

        {/* Nav */}
        <nav className="relative mt-4 flex-1 px-3">
          {config.navItems.map((item) => {
            const isActive =
              item.href === `/${role}/dashboard`
                ? pathname === `/${role}/dashboard`
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                aria-current={isActive ? "page" : undefined}
                className={`group relative mb-1 flex items-center gap-3 overflow-hidden rounded-[6px] px-3 py-2.5 text-[13px] transition-colors ${
                  isActive ? theme.navActive : theme.navInactive
                }`}
              >
                <span className="shrink-0">{getIcon(item.icon)}</span>
                <span className="whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-[#DEDBD1]/10 px-5 py-4">
          <p className={`text-[10px] ${theme.deptFooter}`}>{config.deptTitle}</p>
        </div>
      </aside>

      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      <aside
        className={`relative hidden shrink-0 flex-col transition-[width] duration-300 ease-in-out lg:flex ${
          theme.aside
        } ${collapsed ? "w-[76px]" : "w-[240px]"}`}
      >
        {config.theme === "warm" && <SurveyGraticule />}

        {/* Collapse toggle */}
        <button
          type="button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={`absolute -right-3 top-8 z-20 grid h-6 w-6 place-items-center rounded-full border shadow-[0_1px_3px_rgba(0,0,0,0.15)] transition ${theme.toggleBtn}`}
        >
          <ChevronIcon collapsed={collapsed} />
        </button>

        {/* Brand */}
        <div className="relative flex items-center px-6 pb-8 pt-7">
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"
            }`}
          >
            <p className={`whitespace-nowrap font-serif text-[17px] leading-tight ${theme.brandTitle}`}>
              {config.brandTitle}
              <br />
              {config.brandSubtitle}
            </p>
            <p className={`mt-1.5 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.18em] ${theme.brandSubtitle}`}>
              {config.deptTitle}
            </p>
          </div>
          {collapsed && (
            <div className="mx-auto block text-[#BB892C] scale-110">
              <EmblemMark role={role} />
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="relative mt-2 flex-1 px-3">
          {config.navItems.map((item) => {
            const isActive =
              item.href === `/${role}/dashboard`
                ? pathname === `/${role}/dashboard`
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                title={collapsed ? item.label : undefined}
                className={`group relative mb-1 flex items-center gap-3 overflow-hidden rounded-[6px] px-3 py-2.5 text-[13px] transition-colors ${
                  isActive ? theme.navActive : theme.navInactive
                }`}
              >
                <span className="shrink-0">{getIcon(item.icon)}</span>
                <span
                  className={`whitespace-nowrap transition-all duration-300 ease-in-out ${
                    collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
                  }`}
                >
                  {item.label}
                </span>

                {/* Tooltip for collapsed state */}
                {collapsed && (
                  <span className={`pointer-events-none absolute left-full ml-2 whitespace-nowrap rounded-[6px] px-2.5 py-1.5 text-[12px] opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 z-10 ${theme.tooltip}`}>
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom card or text */}
        {role === "field_officer" ? (
          <div
            className={`relative mx-4 mb-6 overflow-hidden rounded-[8px] border transition-all duration-300 ease-in-out ${
              collapsed ? "max-h-0 border-0 px-0 py-0 opacity-0" : "max-h-[100px] px-4 py-3.5 opacity-100"
            } ${theme.bottomCard}`}
          >
            <p className={`whitespace-nowrap text-[11px] uppercase tracking-[0.14em] ${theme.bottomCardTitle}`}>
              Sri Lanka coverage
            </p>
            <p className="mt-1 whitespace-nowrap text-[12px]">GIS field survey system</p>
          </div>
        ) : (
          <div className="border-t border-[#DEDBD1]/60 px-5 py-4 transition-opacity duration-200">
            <p className={`text-[11px] transition-all whitespace-nowrap overflow-hidden ${collapsed ? "max-w-0 opacity-0" : "max-w-[200px] opacity-100"} ${theme.deptFooter}`}>
              {config.deptTitle}
            </p>
          </div>
        )}
      </aside>
    </>
  );
}

/* ---------------- decorative / svg ---------------- */

function SurveyGraticule() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.08]"
      aria-hidden="true"
    >
      <defs>
        <pattern id="sidebar-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#F4F2ED" strokeWidth="1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#sidebar-grid)" />
    </svg>
  );
}

function ChevronIcon({ collapsed }: { collapsed: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-300 ease-in-out ${
        collapsed ? "rotate-180" : ""
      }`}
    >
      <path
        d="M15 6l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmblemMark({ role }: { role: RoleType }) {
  const strokeColor = role === "field_officer" ? "#FAC437" : "#16283F";
  return (
    <svg width="20" height="20" viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="15" r="13.5" fill="none" stroke={strokeColor} strokeWidth="1.6" />
      <path
        d="M15 8 L20.5 12.2 V19.5 H9.5 V12.2 Z"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="15.5" r="1.7" fill={strokeColor} />
    </svg>
  );
}

/* ---------------- icons ---------------- */

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function getIcon(name: string) {
  switch (name) {
    case "home":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11.5 12 4l8 7.5M6 10v9h12v-9" />
        </svg>
      );
    case "plus-circle":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8.5v7M8.5 12h7" />
        </svg>
      );
    case "map-pin":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.3" />
        </svg>
      );
    case "doc":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 3.5h7l4 4V20a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4.5a1 1 0 0 1 1-1Z" />
          <path d="M9 12h6M9 15.5h6" />
        </svg>
      );
    case "gear":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.14-1.4l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2.4-1.4L14 3h-4l-.16 2.2a7 7 0 0 0-2.4 1.4l-2.3-.9-2 3.4 2 1.5A7 7 0 0 0 5 12a7 7 0 0 0 .14 1.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2.4 1.4L10 21h4l.16-2.2a7 7 0 0 0 2.4-1.4l2.3.9 2-3.4-2-1.5A7 7 0 0 0 19 12Z" strokeWidth="1.3" />
        </svg>
      );
    case "map":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          <line x1="9" y1="3" x2="9" y2="18" />
          <line x1="15" y1="6" x2="15" y2="21" />
        </svg>
      );
    case "shield-check":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 11l2 2 4-4" />
        </svg>
      );
    case "users":
      return (
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    default:
      return null;
  }
}
