"use client";

import { useState } from "react";
import Link from "next/link";
import { apiErrorMessage } from "@/lib/sites";
import { createUser, USER_ROLE_LABELS, USER_ROLE_OPTIONS, type UserRoleName } from "@/lib/users";

export default function RegisterUserPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRoleName>("FIELD_OFFICER");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set once the account is created — the backend only returns this
  // temporary password this one time, so we hold onto it here instead
  // of navigating away immediately.
  const [created, setCreated] = useState<{ name: string; temporaryPassword: string } | null>(
    null
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter the user's first and last name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { user, temporaryPassword } = await createUser({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        role,
      });
      setCreated({ name: `${user.firstName} ${user.lastName}`, temporaryPassword });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (created) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
          <span className="text-[13.5px] text-[#3A2A12] font-semibold">Register user</span>
        </header>

        <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
          <div className="max-w-xl mx-auto rounded-[10px] border border-[#2C6B33]/30 bg-white p-6 shadow-xs">
            <h2 className="font-serif text-[17px] text-[#2C6B33]">
              Account created for {created.name}
            </h2>
            <p className="mt-1.5 text-[13px] text-[#5B6472]">
              Share this temporary password with them securely — it will not be shown again.
              They&apos;ll be required to change it on first login.
            </p>

            <div className="mt-4 rounded-[6px] bg-[#FAF6EB] p-4 border border-[#BB892C]/30 text-center">
              <span className="block text-[10px] uppercase text-[#8F6A21] font-semibold">
                Temporary Password
              </span>
              <code className="block text-[16px] font-mono font-bold text-[#3A2A12] mt-1 select-all">
                {created.temporaryPassword}
              </code>
            </div>

            <div className="mt-6 flex items-center gap-3 border-t border-[#DEDBD1] pt-4">
              <Link
                href="/admin/dashboard/users"
                className="rounded-[6px] bg-[#BB892C] px-5 py-2 text-[13.5px] font-medium text-[#F4F2ED] hover:bg-[#8F6A21] transition"
              >
                Done — back to users
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div className="flex items-center gap-2">
          <Link href="/admin/dashboard/users" className="text-[13px] text-[#BB892C] hover:underline">
            &larr; Back to users
          </Link>
          <span className="text-[#8A8D86] font-light">/</span>
          <span className="text-[13.5px] text-[#3A2A12] font-semibold">Register user</span>
        </div>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <div className="max-w-xl mx-auto rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs">
          <div className="border-b border-[#DEDBD1]/60 pb-3 mb-5">
            <h2 className="font-serif text-[17px] text-[#3A2A12]">Register New User</h2>
            <p className="text-[11.5px] text-[#8A8D86]">
              Create a new user account. No public self-registration is enabled. A temporary
              password is generated automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-[12px] font-bold text-[#5B6472] uppercase mb-1">
                  First Name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Chamari"
                  className="w-full rounded-[6px] border border-[#D4CFC3] px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                />
              </div>

              <div>
                <label htmlFor="lastName" className="block text-[12px] font-bold text-[#5B6472] uppercase mb-1">
                  Last Name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Wickramasinghe"
                  className="w-full rounded-[6px] border border-[#D4CFC3] px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[12px] font-bold text-[#5B6472] uppercase mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. c.wickramasinghe@doa.lk"
                className="w-full rounded-[6px] border border-[#D4CFC3] px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-[12px] font-bold text-[#5B6472] uppercase mb-1">
                System Role
              </label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRoleName)}
                className="w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              >
                {USER_ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {USER_ROLE_LABELS[opt]}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div role="alert" className="rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]">
                {error}
              </div>
            )}

            <div className="mt-6 flex items-center gap-3 border-t border-[#DEDBD1] pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[6px] bg-[#BB892C] px-5 py-2 text-[13.5px] font-medium text-[#F4F2ED] hover:bg-[#8F6A21] disabled:opacity-50 transition"
              >
                {isSubmitting ? "Registering..." : "Register User"}
              </button>
              <Link
                href="/admin/dashboard/users"
                className="rounded-[6px] border border-[#D4CFC3] px-4 py-2 text-[13px] font-medium text-[#5B6472] hover:bg-[#FAF6EB] transition"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
