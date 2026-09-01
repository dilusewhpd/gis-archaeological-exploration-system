"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated || !user) {
      router.replace("/auth/login");
      return;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = user.role?.name;
      if (!userRole || !allowedRoles.includes(userRole)) {
        if (userRole === "FIELD_OFFICER") {
          router.replace("/field_officer/dashboard");
        } else if (userRole === "ANALYST") {
          router.replace("/analyst/dashboard");
        } else if (userRole === "ADMIN" || userRole === "SENIOR_OFFICER") {
          router.replace("/admin/dashboard");
        } else {
          router.replace("/auth/login");
        }
      }
    }
  }, [user, isLoading, isAuthenticated, allowedRoles, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F3EF]">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="h-8 w-8 animate-spin text-[#16283F]"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="9"
              stroke="currentColor"
              strokeWidth="3"
              opacity="0.25"
            />
            <path
              d="M21 12a9 9 0 0 0-9-9"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
          <p className="font-serif text-[14px] text-[#5B6472]">
            Verifying credentials…
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (
    allowedRoles &&
    allowedRoles.length > 0 &&
    (!user.role?.name || !allowedRoles.includes(user.role.name))
  ) {
    return null;
  }

  return <>{children}</>;
}
