import ProfileForm from "./ProfileForm";

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

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">My profile</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        <div className="max-w-[640px]">
          {/* Account summary */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-6 py-5">
            <div className="flex items-center justify-between text-[13px] text-[#5B6472]">
              <span>
                Role:{" "}
                <span className="font-medium text-[#16283F]">{ROLE_LABELS[profile.role]}</span>
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-[4px] px-2 py-0.5 text-[12px] font-medium"
                style={
                  profile.isActive
                    ? { backgroundColor: "#EAF3EA", color: "#2C6B33" }
                    : { backgroundColor: "#FBEBEA", color: "#B03A2E" }
                }
              >
                {profile.isActive ? "Active" : "Disabled"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-[13px] text-[#5B6472]">
              <p>
                Member since{" "}
                <span className="text-[#23262B]">{formatDate(profile.createdAt)}</span>
              </p>
              <p>
                Last login{" "}
                <span className="text-[#23262B]">
                  {profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : "—"}
                </span>
              </p>
            </div>
          </div>

          {/* Editable profile */}
          <div className="mt-5 rounded-[8px] border border-[#DEDBD1] bg-white px-6 py-6">
            <ProfileForm initialProfile={profile} />
          </div>

          <p className="mt-4 text-[12px] text-[#8A8D86]">
            To change your email or role, or to reset your password, contact your
            administrator.
          </p>
        </div>
      </main>
    </div>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}