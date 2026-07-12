"use client";

import { useState, type FormEvent } from "react";

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

type SaveState = "idle" | "saving" | "saved" | "error";

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const isDirty =
    fullName !== profile.fullName || email !== profile.email || phone !== (profile.phone ?? "");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveState("saving");

    try {
      const res = await fetch("/api/analyst/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone: phone || null }),
      });
      if (!res.ok) throw new Error("Request failed");
      setSaveState("saved");
    } catch {
      setSaveState("error");
    }
  }

  function handleCancel() {
    setFullName(profile.fullName);
    setEmail(profile.email);
    setPhone(profile.phone ?? "");
    setSaveState("idle");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-4">
      <Field label="Full name">
        <input
          type="text"
          value={fullName}
          onChange={(e) => {
            setFullName(e.target.value);
            setSaveState("idle");
          }}
          className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#16283F] outline-none focus:border-[#16283F]/40"
        />
      </Field>

      <Field label="Email">
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setSaveState("idle");
          }}
          className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#16283F] outline-none focus:border-[#16283F]/40"
        />
      </Field>

      <Field label="Phone">
        <input
          type="tel"
          value={phone}
          placeholder="Not provided"
          onChange={(e) => {
            setPhone(e.target.value);
            setSaveState("idle");
          }}
          className="w-full rounded-[6px] border border-[#DEDBD1] px-3 py-2 text-[13px] text-[#16283F] outline-none placeholder:text-[#8A8D86] focus:border-[#16283F]/40"
        />
      </Field>

      <Field label="Role">
        <input
          type="text"
          value={profile.role}
          disabled
          className="w-full rounded-[6px] border border-[#DEDBD1] bg-[#F4F3EF] px-3 py-2 text-[13px] text-[#8A8D86]"
        />
      </Field>

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={!isDirty || saveState === "saving"}
          className="rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
        >
          {saveState === "saving" ? "Saving…" : "Save changes"}
        </button>

        {isDirty && (
          <button
            type="button"
            onClick={handleCancel}
            className="text-[13px] font-medium text-[#5B6472] hover:text-[#16283F]"
          >
            Cancel
          </button>
        )}

        {saveState === "saved" && (
          <span className="text-[13px] text-[#2F5C3B]">Saved.</span>
        )}
        {saveState === "error" && (
          <span className="text-[13px] text-[#9A4B2E]">
            Couldn&apos;t save changes. Try again.
          </span>
        )}
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