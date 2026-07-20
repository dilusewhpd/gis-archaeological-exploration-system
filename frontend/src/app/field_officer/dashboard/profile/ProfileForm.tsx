"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "./page";

const UPDATE_ENDPOINT = "/api/users/me";

export default function ProfileForm({ initialProfile }: { initialProfile: UserProfile }) {
  const router = useRouter();

  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialProfile.profileImageUrl
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setSaved(false);
  }

  function handleCancel() {
    setFullName(initialProfile.fullName);
    setPhone(initialProfile.phone ?? "");
    setPhotoFile(null);
    setPhotoPreview(initialProfile.profileImageUrl);
    setError(null);
    setSaved(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSaved(false);

    if (!fullName.trim()) {
      setError("Name can't be empty.");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("fullName", fullName.trim());
      formData.append("phone", phone.trim());
      if (photoFile) formData.append("photo", photoFile);

      const res = await fetch(UPDATE_ENDPOINT, { method: "PATCH", body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Couldn't save your changes. Please try again.");
        return;
      }

      setSaved(true);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const isDirty =
    fullName !== initialProfile.fullName ||
    phone !== (initialProfile.phone ?? "") ||
    photoFile !== null;

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
      {/* Left Column: Photo + role summary */}
      <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-6 text-center h-fit">
        <div className="flex flex-col items-center">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt={`${initialProfile.fullName}'s profile photo`}
              className="h-[88px] w-[88px] rounded-full border border-[#DEDBD1] object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-[88px] w-[88px] items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F0E6C8] font-serif text-[32px] text-[#8F6A21]"
            >
              {initials}
            </div>
          )}

          <label className="mt-3 cursor-pointer text-[12px] font-medium text-[#BB892C] underline-offset-2 hover:underline">
            {photoPreview ? "Replace photo" : "Add profile photo"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handlePhotoChange}
            />
          </label>

          <h2 className="mt-4 font-serif text-[17px] text-[#3A2A12]">{fullName}</h2>
          <p className="mt-0.5 text-[13px] text-[#5B6472]">Field officer</p>

          <span
            className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium"
            style={
              initialProfile.isActive
                ? { backgroundColor: "#EAF3EA", color: "#2C6B33" }
                : { backgroundColor: "#FBEBEA", color: "#B03A2E" }
            }
          >
            {initialProfile.isActive ? "Active" : "Disabled"}
          </span>
        </div>

        <div className="mt-6 border-t border-[#DEDBD1] pt-4 text-left space-y-3 text-[13px] text-[#5B6472]">
          <div>
            <p className="text-[12px] text-[#8A8D86]">Member since</p>
            <p className="mt-0.5 text-[#3A4048]">{formatDate(initialProfile.createdAt)}</p>
          </div>
          {initialProfile.lastLoginAt && (
            <div>
              <p className="text-[12px] text-[#8A8D86]">Last login</p>
              <p className="mt-0.5 text-[#3A4048]">{formatDateTime(initialProfile.lastLoginAt)}</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Editable profile info */}
      <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5 h-fit">
        <h2 className="text-[14px] font-medium text-[#3A2A12]">Profile information</h2>
        <p className="mt-1 text-[13px] text-[#8A8D86]">
          Keep your contact details up to date.
        </p>

        <div className="mt-4 space-y-4">
          <Field label="Full name">
            <input
              type="text"
              value={fullName}
              onChange={(e) => {
                setFullName(e.target.value);
                setSaved(false);
              }}
              className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#3A2A12] outline-none focus:border-[#BB892C]/40 focus:ring-1 focus:ring-[#BB892C]/40"
            />
          </Field>

          <Field label="Work email">
            <input
              type="email"
              value={initialProfile.email}
              disabled
              className="w-full cursor-not-allowed rounded-[6px] border border-[#DEDBD1] bg-[#FAF6EB] px-3 py-2 text-[13px] text-[#8A8D86]"
            />
          </Field>

          <Field label="Phone">
            <input
              type="text"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setSaved(false);
              }}
              placeholder="Not provided"
              className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#3A2A12] outline-none placeholder:text-[#8A8D86] focus:border-[#BB892C]/40 focus:ring-1 focus:ring-[#BB892C]/40"
            />
          </Field>

          <Field label="Role">
            <input
              type="text"
              value="Field officer"
              disabled
              className="w-full cursor-not-allowed rounded-[6px] border border-[#DEDBD1] bg-[#FAF6EB] px-3 py-2 text-[13px] text-[#8A8D86]"
            />
          </Field>

          {error && (
            <div
              role="alert"
              className="rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
            >
              {error}
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="flex items-center gap-2 rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
            >
              {isSaving && <Spinner />}
              {isSaving ? "Saving…" : "Save changes"}
            </button>
            {isDirty && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSaving}
                className="text-[13px] font-medium text-[#5B6472] hover:text-[#BB892C]"
              >
                Cancel
              </button>
            )}
            {saved && <span className="text-[13px] text-[#2F5C3B]">Saved.</span>}
          </div>
        </div>
      </div>
    </form>
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

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin text-[#F4F2ED]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}