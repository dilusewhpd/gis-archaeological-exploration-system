"use client";

import Link from "next/link";
import { useState } from "react";
import { apiErrorMessage } from "@/lib/sites";
import {
  deactivateUser,
  resetUserPassword,
  updateUser,
  USER_ROLE_LABELS,
  USER_ROLE_OPTIONS,
  type UserRecord,
  type UserRoleName,
} from "@/lib/users";

export function EditUserForm({ user: initialUser }: { user: UserRecord }) {
  const [user, setUser] = useState(initialUser);
  const [firstName, setFirstName] = useState(initialUser.firstName);
  const [lastName, setLastName] = useState(initialUser.lastName);
  const [email, setEmail] = useState(initialUser.email);
  const [role, setRole] = useState<UserRoleName>(initialUser.role.name as UserRoleName);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Reset password states
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // Suspend/reactivate states
  const [isToggling, setIsToggling] = useState(false);
  const [toggleError, setToggleError] = useState<string | null>(null);

  const isDirty =
    firstName !== user.firstName ||
    lastName !== user.lastName ||
    email !== user.email ||
    role !== user.role.name;

  async function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    setIsSaving(true);
    try {
      const updated = await updateUser(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
      });
      setUser(updated);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setSaveError(apiErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleResetPassword() {
    setIsResetting(true);
    setTempPassword(null);
    setResetError(null);
    try {
      const password = await resetUserPassword(user.id);
      setTempPassword(password);
    } catch (err) {
      setResetError(apiErrorMessage(err));
    } finally {
      setIsResetting(false);
    }
  }

  async function handleToggleStatus() {
    const willDeactivate = user.isActive;
    const confirmed = window.confirm(
      willDeactivate
        ? `Deactivate account for ${firstName} ${lastName}? They will lose dashboard access immediately.`
        : `Reactivate account for ${firstName} ${lastName}?`
    );
    if (!confirmed) return;

    setToggleError(null);
    setIsToggling(true);
    try {
      if (willDeactivate) {
        await deactivateUser(user.id);
        setUser((prev) => ({ ...prev, isActive: false }));
      } else {
        const updated = await updateUser(user.id, { isActive: true });
        setUser(updated);
      }
    } catch (err) {
      setToggleError(apiErrorMessage(err));
    } finally {
      setIsToggling(false);
    }
  }

  const initials = `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      {/* Left Column: Form Details */}
      <div className="lg:col-span-2 space-y-6">
        <form onSubmit={handleSave} className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs">
          <div className="border-b border-[#DEDBD1]/60 pb-3 mb-5">
            <h2 className="font-serif text-[16px] text-[#3A2A12]">Account Details</h2>
            <p className="text-[11.5px] text-[#8A8D86]">
              Modify user credentials, database roles, and account levels.
            </p>
          </div>

          <div className="space-y-4.5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="First Name">
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setSaved(false);
                  }}
                  className="w-full rounded-[6px] border border-[#D4CFC3] px-3.5 py-2 text-[13px] text-[#3A2A12] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                />
              </Field>

              <Field label="Last Name">
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setSaved(false);
                  }}
                  className="w-full rounded-[6px] border border-[#D4CFC3] px-3.5 py-2 text-[13px] text-[#3A2A12] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                />
              </Field>
            </div>

            <Field label="Email Address">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setSaved(false);
                }}
                className="w-full rounded-[6px] border border-[#D4CFC3] px-3.5 py-2 text-[13px] text-[#3A2A12] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
            </Field>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Database System Role">
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value as UserRoleName);
                    setSaved(false);
                  }}
                  className="w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2 text-[13px] text-[#3A2A12] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                >
                  {USER_ROLE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {USER_ROLE_LABELS[option]}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Current Access Status">
                <div className="mt-1.5 flex items-center">
                  <span
                    className={
                      "inline-flex items-center rounded-full px-3 py-1 text-[11.5px] font-semibold " +
                      (user.isActive
                        ? "bg-[#EAF1EA] text-[#2F5C3B] border border-[#BCE2C4]/40"
                        : "bg-[#F6E8E3] text-[#9A4B2E] border border-[#E9C4B7]/40")
                    }
                  >
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${user.isActive ? "bg-[#2C6B33]" : "bg-[#9A4B2E]"}`} />
                    {user.isActive ? "Active" : "Disabled"}
                  </span>
                </div>
              </Field>
            </div>
          </div>

          {saveError && (
            <div role="alert" className="mt-4 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]">
              {saveError}
            </div>
          )}

          <div className="mt-6 flex items-center gap-3 border-t border-[#DEDBD1] pt-4">
            <button
              type="submit"
              disabled={!isDirty || isSaving}
              className="rounded-[6px] bg-[#BB892C] px-5 py-2 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:bg-[#DEDBD1] disabled:text-[#8A8D86]"
            >
              {isSaving ? "Saving…" : "Save changes"}
            </button>

            <Link
              href="/admin/dashboard/users"
              className="rounded-[6px] border border-[#D4CFC3] px-4 py-2 text-[13px] font-medium text-[#5B6472] hover:bg-[#FAF6EB] transition"
            >
              Cancel
            </Link>

            {saved && (
              <span className="text-[13px] font-medium text-[#2C6B33]">
                Changes saved successfully.
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Right Column: User Profile Monogram & Action Panel */}
      <div className="space-y-6">
        {/* Monogram card */}
        <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#DEDBD1] bg-gradient-to-tr from-[#FAF6EB] to-[#FAF6EB]/40 shadow-inner">
            <span className="font-serif text-[24px] font-bold text-[#8F6A21] tracking-wider">{initials}</span>
          </div>
          <h3 className="mt-4 font-serif text-[15.5px] font-medium text-[#3A2A12]">
            {firstName} {lastName}
          </h3>
          <p className="text-[11.5px] text-[#8A8D86] font-medium">{email}</p>
          <span className="mt-2.5 rounded bg-[#F4F2ED] px-2.5 py-0.5 text-[11px] font-semibold text-[#8F6A21] border border-[#DEDBD1]/60">
            {USER_ROLE_LABELS[role]}
          </span>
        </div>

        {/* Action card */}
        <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs">
          <div className="border-b border-[#DEDBD1]/60 pb-2.5 mb-4">
            <h3 className="font-serif text-[14.5px] text-[#3A2A12]">Account Administration</h3>
          </div>

          <div className="space-y-4">
            {/* Reset password section */}
            <div>
              <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">User Authentication</span>
              <p className="text-[11px] text-[#5B6472] mt-0.5">
                Generate temporary credentials to bypass forgotten password locks.
              </p>

              {tempPassword && (
                <div className="mt-2.5 rounded-[6px] bg-[#FAF6EB] p-3 border border-[#BB892C]/30 text-center">
                  <span className="block text-[10px] uppercase text-[#8F6A21] font-semibold">Temporary Credentials Generated</span>
                  <code className="block text-[13px] font-mono font-bold text-[#3A2A12] mt-1 select-all">{tempPassword}</code>
                  <span className="block text-[9.5px] text-[#8A8D86] mt-1">Copy and share securely with the user.</span>
                </div>
              )}

              {resetError && (
                <div className="mt-2.5 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3 py-2 text-[11.5px] text-[#8A3A20]">
                  {resetError}
                </div>
              )}

              <button
                type="button"
                onClick={handleResetPassword}
                disabled={isResetting}
                className="mt-3 flex w-full items-center justify-center rounded-[6px] border border-[#D4CFC3] bg-[#FAF6EB]/40 py-2 text-[12.5px] font-medium text-[#3A2A12] transition hover:bg-[#FAF6EB] hover:border-[#BB892C]/40"
              >
                {isResetting ? "Generating..." : tempPassword ? "Re-generate Password" : "Reset User Password"}
              </button>
            </div>

            {/* Suspend/Reactivate section */}
            <div className="border-t border-[#DEDBD1]/60 pt-4">
              <span className="block text-[11px] text-[#8A8D86] uppercase font-semibold">Security Access Rules</span>
              <p className="text-[11px] text-[#5B6472] mt-0.5">
                Suspend database credentials immediately if keys are compromised.
              </p>

              {toggleError && (
                <div className="mt-2.5 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3 py-2 text-[11.5px] text-[#8A3A20]">
                  {toggleError}
                </div>
              )}

              <button
                type="button"
                onClick={handleToggleStatus}
                disabled={isToggling}
                className={
                  "mt-3 flex w-full items-center justify-center rounded-[6px] border py-2 text-[12.5px] font-medium transition disabled:opacity-50 " +
                  (user.isActive
                    ? "border-[#DEDBD1] text-[#9A4B2E] hover:border-[#9A4B2E]/40 hover:bg-[#FAF6EB]/20"
                    : "border-[#DEDBD1] text-[#2F5C3B] hover:border-[#2F5C3B]/40 hover:bg-[#FAF6EB]/20")
                }
              >
                {isToggling ? "Working…" : user.isActive ? "Deactivate Account" : "Activate Account"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11.5px] text-[#5B6472] font-semibold">{label}</span>
      {children}
    </label>
  );
}
