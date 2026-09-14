"use client";

import { useState } from "react";
import LogoutButton from "@/components/LogoutButton";

/**
 * Senior officer profile — /senior_officer/dashboard/profile
 *
 * FRONTEND-ONLY, same pattern as the admin/analyst profile pages: profile
 * data is mocked locally and "Save changes" just updates local state.
 * Once a real profile endpoint exists, wire this to it the same way.
 */

type SeniorOfficerProfile = {
  fullName: string;
  email: string;
  phone: string | null;
  photoUrl: string | null;
  joinedDate: string;
};

const SENIOR_OFFICER_PROFILE: SeniorOfficerProfile = {
  fullName: "Chamari Wickramasinghe",
  email: "c.wickramasinghe@archaeology.gov.lk",
  phone: "+94 76 512 3456",
  photoUrl: null,
  joinedDate: "2023-08-01",
};

export default function SeniorOfficerProfilePage() {
  const [fullName, setFullName] = useState(SENIOR_OFFICER_PROFILE.fullName);
  const [email, setEmail] = useState(SENIOR_OFFICER_PROFILE.email);
  const [phone, setPhone] = useState(SENIOR_OFFICER_PROFILE.phone ?? "");
  const [hasPhoto, setHasPhoto] = useState(Boolean(SENIOR_OFFICER_PROFILE.photoUrl));
  const [saved, setSaved] = useState(false);

  const isDirty =
    fullName !== SENIOR_OFFICER_PROFILE.fullName ||
    email !== SENIOR_OFFICER_PROFILE.email ||
    phone !== (SENIOR_OFFICER_PROFILE.phone ?? "");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  function handleCancel() {
    setFullName(SENIOR_OFFICER_PROFILE.fullName);
    setEmail(SENIOR_OFFICER_PROFILE.email);
    setPhone(SENIOR_OFFICER_PROFILE.phone ?? "");
    setSaved(false);
  }

  const initials = fullName
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
          <LogoutButton className="text-[13px] font-medium text-[#5B6472] transition hover:text-[#BB892C]" />
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] font-serif text-[12px] text-[#8F6A21]">
            {initials}
          </div>
        </div>
      </header>

      <main className="flex-1 px-8 py-7">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
          {/* Photo + role summary */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-6 text-center">
            <div className="flex flex-col items-center">
              <div
                className="flex items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] font-serif text-[#8F6A21]"
                style={{ width: 88, height: 88, fontSize: 32 }}
              >
                {initials}
              </div>

              <label className="mt-3 cursor-pointer text-[12px] font-medium text-[#BB892C] underline-offset-2 hover:underline">
                {hasPhoto ? "Replace photo" : "Add profile photo"}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={() => setHasPhoto(true)}
                />
              </label>

              <h2 className="mt-4 font-serif text-[17px] text-[#3A2A12]">{fullName}</h2>
              <p className="mt-0.5 text-[13px] text-[#5B6472]">Senior Officer</p>

              <span className="mt-3 rounded-full bg-[#FAF6EB] px-3 py-1 text-[12px] text-[#8A8478]">
                All regions
              </span>
            </div>

            <div className="mt-6 border-t border-[#DEDBD1] pt-4 text-left">
              <p className="text-[12px] text-[#8A8D86]">Member since</p>
              <p className="mt-0.5 text-[13px] text-[#3A4048]">
                {formatDate(SENIOR_OFFICER_PROFILE.joinedDate)}
              </p>
            </div>
          </div>

          {/* Editable profile info */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
            <h2 className="text-[14px] font-medium text-[#3A2A12]">Profile information</h2>
            <p className="mt-1 text-[13px] text-[#8A8D86]">
              Keep your contact details up to date.
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Field label="Full name">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setSaved(false);
                  }}
                  className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#3A2A12] outline-none focus:border-[#BB892C]/40"
                />
              </Field>

              <Field label="Email">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSaved(false);
                  }}
                  className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#3A2A12] outline-none focus:border-[#BB892C]/40"
                />
              </Field>

              <Field label="Phone">
                <input
                  type="tel"
                  value={phone}
                  placeholder="Not provided"
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setSaved(false);
                  }}
                  className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#3A2A12] outline-none placeholder:text-[#8A8D86] focus:border-[#BB892C]/40"
                />
              </Field>

              <Field label="Role">
                <input
                  type="text"
                  value="Senior Officer"
                  disabled
                  className="w-full rounded-[6px] border border-[#DEDBD1] bg-[#FAF6EB] px-3 py-2 text-[13px] text-[#8A8D86]"
                />
              </Field>

              <div className="flex items-center gap-3 pt-1">
                <button
                  type="submit"
                  disabled={!isDirty}
                  className="rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
                >
                  Save changes
                </button>

                {isDirty && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-[13px] font-medium text-[#5B6472] hover:text-[#BB892C]"
                  >
                    Cancel
                  </button>
                )}

                {saved && <span className="text-[13px] text-[#2F5C3B]">Saved.</span>}
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] text-[#5B6472]">{label}</span>
      {children}
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
