"use client";

import Link from "next/link";
import { useState } from "react";
import type { UserAccount, UserRole } from "../../mock-users";

const ROLE_OPTIONS: UserRole[] = ["Admin", "Analyst", "Field Officer"];

/**
 * FRONTEND-ONLY: Save, Reset password, and Deactivate/Activate all just
 * show a confirmation message — no fetch calls yet. When the backend
 * exists:
 *  - Save        → PATCH /api/admin/users/[id]
 *  - Reset pw    → POST  /api/admin/users/[id]/reset-password
 *  - Deactivate  → PATCH /api/admin/users/[id]/status
 */
export function EditUserForm({ user }: { user: UserAccount }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [status, setStatus] = useState(user.status);
  const [saved, setSaved] = useState(false);

  const isDirty =
    fullName !== user.fullName || email !== user.email || role !== user.role;

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaved(true);
  }

  function handleResetPassword() {
    const confirmed = window.confirm(
      `Reset the password for ${fullName}? They'll receive an email with instructions.`
    );
    if (!confirmed) return;
    window.alert(`Password reset email sent to ${email}.`);
  }

  function handleToggleStatus() {
    const willDeactivate = status === "Active";
    const confirmed = window.confirm(
      willDeactivate
        ? `Deactivate ${fullName}? They'll lose access until reactivated.`
        : `Reactivate ${fullName}?`
    );
    if (!confirmed) return;
    setStatus(willDeactivate ? "Disabled" : "Active");
  }

  return (
    <div className="space-y-5">
      <form onSubmit={handleSave} className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
        <h2 className="text-[14px] font-medium text-[#3A2A12]">Account details</h2>

        <div className="mt-4 space-y-4">
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

          <Field label="Role">
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserRole);
                setSaved(false);
              }}
              className="w-full rounded-[6px] border border-[#DEDBD1] bg-white px-3 py-2 text-[13px] text-[#3A2A12] outline-none focus:border-[#BB892C]/40"
            >
              {ROLE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status">
            <span
              className={
                "inline-block rounded-full px-2.5 py-1 text-[12px] font-medium " +
                (status === "Active" ? "bg-[#EAF1EA] text-[#2F5C3B]" : "bg-[#F6E8E3] text-[#9A4B2E]")
              }
            >
              {status}
            </span>
          </Field>
        </div>

        <div className="mt-5 flex items-center gap-3 border-t border-[#DEDBD1] pt-4">
          <button
            type="submit"
            disabled={!isDirty}
            className="rounded-[6px] bg-[#BB892C] px-4 py-2.5 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
          >
            Save changes
          </button>

          <Link
            href="/admin/dashboard/users"
            className="text-[13px] font-medium text-[#5B6472] hover:text-[#BB892C]"
          >
            Cancel
          </Link>

          {saved && <span className="text-[13px] text-[#2F5C3B]">Saved.</span>}
        </div>
      </form>

      <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
        <h2 className="text-[14px] font-medium text-[#3A2A12]">Account actions</h2>
        <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
          <button
            type="button"
            onClick={handleResetPassword}
            className="flex items-center justify-center rounded-[6px] border border-[#DEDBD1] px-4 py-2.5 text-[13px] font-medium text-[#3A2A12] transition hover:border-[#BB892C]/30 hover:text-[#BB892C]"
          >
            Reset password
          </button>

          <button
            type="button"
            onClick={handleToggleStatus}
            className={
              "flex items-center justify-center rounded-[6px] border px-4 py-2.5 text-[13px] font-medium transition " +
              (status === "Active"
                ? "border-[#DEDBD1] text-[#9A4B2E] hover:border-[#9A4B2E]/40"
                : "border-[#DEDBD1] text-[#2F5C3B] hover:border-[#2F5C3B]/40")
            }
          >
            {status === "Active" ? "Deactivate account" : "Activate account"}
          </button>
        </div>
      </div>
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