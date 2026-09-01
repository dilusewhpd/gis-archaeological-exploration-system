export type RoleType = "field_officer" | "senior_officer" | "analyst" | "admin";

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export interface RoleConfig {
  theme: "warm" | "cool";
  brandTitle: string;
  brandSubtitle: string;
  deptTitle: string;
  navItems: NavItem[];
}

export const ROLE_CONFIGS: Record<RoleType, RoleConfig> = {
  field_officer: {
    theme: "warm",
    brandTitle: "Exploration Data",
    brandSubtitle: "Management System",
    deptTitle: "Department of Archaeology",
    navItems: [
      { href: "/field_officer/dashboard", label: "Dashboard", icon: "home" },
      { href: "/field_officer/dashboard/new-site", label: "Submit report", icon: "plus-circle" },
      { href: "/field_officer/dashboard/records", label: "My sites", icon: "map-pin" },
      { href: "/field_officer/dashboard/gis-map", label: "GIS map", icon: "map" },
      { href: "/field_officer/dashboard/reports", label: "Reports", icon: "doc" },
      { href: "/field_officer/dashboard/profile", label: "Settings", icon: "gear" },
    ],
  },
  senior_officer: {
    theme: "warm",
    brandTitle: "GIS Archaeology",
    brandSubtitle: "Approval Portal",
    deptTitle: "Department of Archaeology",
    navItems: [
      { href: "/senior_officer/dashboard", label: "Review queue", icon: "home" },
      { href: "/senior_officer/dashboard/gis-map", label: "GIS map", icon: "map" },
      { href: "/senior_officer/dashboard/decisions", label: "Decision support", icon: "shield-check" },
      { href: "/senior_officer/dashboard/reports", label: "Reports", icon: "doc" },
      { href: "/senior_officer/dashboard/profile", label: "Profile", icon: "gear" },
    ],
  },
  analyst: {
    theme: "warm",
    brandTitle: "GIS Archaeology",
    brandSubtitle: "Analysis Portal",
    deptTitle: "Department of Archaeology",
    navItems: [
      { href: "/analyst/dashboard", label: "Dashboard", icon: "home" },
      { href: "/analyst/dashboard/gis-map", label: "GIS map", icon: "map" },
      { href: "/analyst/dashboard/risk-assessment", label: "Risk assessment", icon: "shield-check" },
      { href: "/analyst/dashboard/decisions", label: "Decision support", icon: "shield-check" },
      { href: "/analyst/dashboard/reports", label: "Reports", icon: "doc" },
      { href: "/analyst/dashboard/profile", label: "Profile", icon: "gear" },
    ],
  },
  admin: {
    theme: "warm",
    brandTitle: "GIS Archaeology",
    brandSubtitle: "Admin Control",
    deptTitle: "Department of Archaeology",
    navItems: [
      { href: "/admin/dashboard", label: "Dashboard", icon: "home" },
      { href: "/admin/dashboard/gis-map", label: "GIS map", icon: "map" },
      { href: "/admin/dashboard/risk-assessment", label: "Risk assessment", icon: "shield-check" },
      { href: "/admin/dashboard/decisions", label: "Decision support", icon: "shield-check" },
      { href: "/admin/dashboard/users", label: "Users", icon: "users" },
      { href: "/admin/dashboard/profile", label: "Profile", icon: "gear" },
    ],
  },
};

export function hasPermission(role: RoleType, route: string): boolean {
  const config = ROLE_CONFIGS[role];
  if (!config) return false;
  
  if (role === "admin") return true;
  
  return config.navItems.some(item => route.startsWith(item.href));
}
