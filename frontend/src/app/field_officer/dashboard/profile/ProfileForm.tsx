"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import type { UserProfile } from "./page";

const UPDATE_ENDPOINT = "/api/users/me";

export default function ProfileForm({ initialProfile }: { initialProfile: UserProfile }) {
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    initialProfile.profileImageUrl
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview((prev) => {
      if (prev && prev.startsWith("blob:")) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function handleCancel() {
    setFullName(initialProfile.fullName);
    setPhone(initialProfile.phone ?? "");
    setPhotoFile(null);
    setPhotoPreview(initialProfile.profileImageUrl);
    setError(null);
    setIsEditing(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

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

      setIsEditing(false);
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSaving(false);
    }
  }

  const initials = getInitials(initialProfile.fullName);

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="flex items-center gap-4">
        <div className="relative">
          {photoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoPreview}
              alt={`${initialProfile.fullName}'s profile photo`}
              className="h-16 w-16 rounded-full border border-[#DEDBD1] object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-16 w-16 items-center justify-center rounded-full border border-[#DEDBD1] bg-[#F4F3EF] font-serif text-[18px] text-[#16283F]"
            >
              {initials}
            </div>
          )}

          {isEditing && (
            <label
              htmlFor="profilePhoto"
              className="absolute -bottom-1 -right-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border border-[#DEDBD1] bg-white text-[#5B6472] shadow-[0_1px_2px_rgba(20,25,33,0.08)] hover:text-[#16283F]"
              aria-label="Change profile photo"
            >
              <CameraIcon />
              <input
                id="profilePhoto"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        <div>
          <p className="text-[15px] font-medium text-[#16283F]">{initialProfile.fullName}</p>
          <p className="text-[13px] text-[#5B6472]">{initialProfile.email}</p>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="ml-auto rounded-[6px] border border-[#DEDBD1] px-3.5 py-1.5 text-[13px] font-medium text-[#16283F] transition hover:border-[#16283F]/40"
          >
            Edit profile
          </button>
        )}
      </div>

      {isEditing && (
        <div className="mt-6 space-y-4">
          <div>
            <label htmlFor="fullName" className="block text-[13px] font-medium text-[#3A4048]">
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] outline-none transition focus:border-[#16283F] focus:ring-2 focus:ring-[#16283F]/10"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-[#3A4048]">
              Work email
            </label>
            <input
              id="email"
              type="email"
              value={initialProfile.email}
              disabled
              className="mt-1.5 w-full cursor-not-allowed rounded-[6px] border border-[#DEDBD1] bg-[#F4F3EF] px-3.5 py-2.5 text-[14px] text-[#8A8D86]"
            />
            <p className="mt-1 text-[12px] text-[#8A8D86]">
              Contact your administrator to change this.
            </p>
          </div>

          <div>
            <label htmlFor="phone" className="block text-[13px] font-medium text-[#3A4048]">
              Phone
            </label>
            <input
              id="phone"
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+94 71 234 5678"
              className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#16283F] focus:ring-2 focus:ring-[#16283F]/10"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
            >
              {error}
            </div>
          )}

          <div className="flex gap-2.5 pt-1">
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center gap-2 rounded-[6px] bg-[#16283F] px-4 py-2 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving && <Spinner />}
              {isSaving ? "Saving…" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-[6px] border border-[#DEDBD1] px-4 py-2 text-[13px] font-medium text-[#5B6472] transition hover:border-[#16283F]/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isEditing && initialProfile.phone && (
        <p className="mt-4 text-[13px] text-[#5B6472]">
          Phone: <span className="text-[#23262B]">{initialProfile.phone}</span>
        </p>
      )}
    </form>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function CameraIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-3.5 w-3.5 animate-spin text-[#F4F2ED]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}