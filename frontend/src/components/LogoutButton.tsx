"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
  className?: string;
}

export default function LogoutButton({ className }: LogoutButtonProps) {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className={
        className ||
        "text-[13px] font-medium text-[#5B6472] transition hover:text-[#16283F]"
      }
    >
      Log out
    </button>
  );
}
