import ProfileForm from "./ProfileForm";
import Link from "next/link";

/**
 * My profile — /field_officer/dashboard/profile
 *
 * Covers "User views own profile information" and "User updates own
 * profile information" (<<extends>> Update profile image).
 *
 * Deliberately does NOT include a change-password field: per the auth
 * design for this system, only an admin can reset a password (see
 * /auth/forgot-password) — there is no self-service path, logged in or
 * not.
 *
 * Server component: fetches the current user's profile, then hands it to
 * a client component for the editable parts (name, phone, photo).
 */

const ME_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/users/me`;

export type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: "field_officer" | "analyst" | "admin";
  profileImageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

const FALLBACK_PROFILE: UserProfile = {
  id: "u1",
  fullName: "J. Perera",
  email: "j.perera@doa.lk",
  phone: "+94 71 234 5678",
  role: "field_officer",
  profileImageUrl: null,
  isActive: true,
  createdAt: "2025-11-03",
  lastLoginAt: "2026-07-12T08:41:00Z",
};

async function getProfile(): Promise<UserProfile> {
  try {
    const res = await fetch(ME_ENDPOINT, { cache: "no-store" });
    if (!res.ok) throw new Error("request failed");
    return (await res.json()) as UserProfile;
  } catch {
    return FALLBACK_PROFILE;
  }
}

const ROLE_LABELS: Record<UserProfile["role"], string> = {
  field_officer: "Field officer",
  analyst: "Analyst",
  admin: "Admin",
};

export default async function ProfilePage() {
  const profile = await getProfile();
  const initials = profile.fullName
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">Profile</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/logout"
            className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#BB892C]"
          >
            Log out
          </Link>
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] font-serif text-[12px] text-[#8F6A21]">
            {initials}
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-7">
        <div className="max-w-[800px]">
          <ProfileForm initialProfile={profile} />
          <p className="mt-4 text-[12px] text-[#8A8D86]">
            To change your email or role, or to reset your password, contact your
            administrator.
          </p>
        </div>
      </main>
    </div>
  );
}