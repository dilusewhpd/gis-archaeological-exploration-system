import Image from "next/image";
import Link from "next/link";
import { ProfileForm } from "./profile-form";

/**
 * Analyst profile — /analyst/dashboard/profile
 *
 * Server component: fetches the signed-in user's profile info.
 * Replace PROFILE_ENDPOINT with your real API route; falls back to
 * placeholder data if the request fails.
 *
 * Use-case mapping:
 *  - "User views own profile information" (Authentication and User
 *     Management module)
 *  - "User update own profile information" --<<extends>>--> "Update
 *     profile image" (shown only when the user has no photo, per the
 *     "If haven't profile photo" guard on the diagram)
 *
 * The actual field-editing (PATCH) and photo upload are client
 * interactions — this page renders the form shell and passes control to
 * a small client component (ProfileForm) for the editable parts. Wire
 * ProfileForm's submit handler to your real API route.
 */

const PROFILE_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/analyst/profile`;

type UserProfile = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  region: string;
  phone: string | null;
  photoUrl: string | null;
  joinedDate: string;
};

const FALLBACK_DATA: UserProfile = {
  id: "user1",
  fullName: "Nadeesha Perera",
  email: "n.perera@archaeology.gov.lk",
  role: "Analyst",
  region: "Central Province",
  phone: "+94 71 234 5678",
  photoUrl: null,
  joinedDate: "2025-03-12",
};

async function getProfileData(): Promise<UserProfile> {
  try {
    const res = await fetch(PROFILE_ENDPOINT, { cache: "no-store" });
    if (!res.ok) return FALLBACK_DATA;
    return (await res.json()) as UserProfile;
  } catch {
    return FALLBACK_DATA;
  }
}

export default async function AnalystProfilePage() {
  const profile = await getProfileData();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-white px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#16283F]">Profile</h1>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/logout"
            className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#16283F]"
          >
            Log out
          </Link>
          <Avatar photoUrl={profile.photoUrl} name={profile.fullName} size={32} />
        </div>
      </header>

      <main className="flex-1 px-8 py-7">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Photo + role summary */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-6 text-center">
            <div className="flex flex-col items-center">
              <Avatar photoUrl={profile.photoUrl} name={profile.fullName} size={88} />

              <PhotoUploadControl hasPhoto={Boolean(profile.photoUrl)} />

              <h2 className="mt-4 font-serif text-[17px] text-[#16283F]">{profile.fullName}</h2>
              <p className="mt-0.5 text-[13px] text-[#5B6472]">{profile.role}</p>

              <span className="mt-3 rounded-full bg-[#F4F3EF] px-3 py-1 text-[12px] text-[#5B6472]">
                {profile.region}
              </span>
            </div>

            <div className="mt-6 border-t border-[#DEDBD1] pt-4 text-left">
              <p className="text-[12px] text-[#8A8D86]">Member since</p>
              <p className="mt-0.5 text-[13px] text-[#3A4048]">
                {formatDate(profile.joinedDate)}
              </p>
            </div>
          </div>

          {/* Editable profile info */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
            <h2 className="text-[14px] font-medium text-[#16283F]">Profile information</h2>
            <p className="mt-1 text-[13px] text-[#8A8D86]">
              Keep your contact details up to date so admins and field officers can reach you.
            </p>

            <ProfileForm profile={profile} />
          </div>
        </div>
      </main>
    </div>
  );
}

function Avatar({
  photoUrl,
  name,
  size,
}: {
  photoUrl: string | null;
  name: string;
  size: number;
}) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  if (photoUrl) {
    return (
      <Image
        src={photoUrl}
        alt={name}
        width={size}
        height={size}
        className="rounded-full border border-[#DEDBD1] object-cover"
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F4F3EF] font-serif text-[#16283F]"
      style={{ width: size, height: size, fontSize: size / 2.6 }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}

/**
 * Only rendered path that matches the "If haven't profile photo" extend
 * guard — when a photo already exists this becomes a lower-key "Replace
 * photo" affordance instead of the extend flow.
 */
function PhotoUploadControl({ hasPhoto }: { hasPhoto: boolean }) {
  return (
    <label className="mt-3 cursor-pointer text-[12px] font-medium text-[#16283F] underline-offset-2 hover:underline">
      {hasPhoto ? "Replace photo" : "Add profile photo"}
      <input type="file" accept="image/*" className="sr-only" />
    </label>
  );
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}