"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getUsers, saveUsers, type UserAccount, type UserRole } from "../mock-users";

const ROLE_OPTIONS: UserRole[] = ["Admin", "Analyst", "Field Officer", "Senior Officer"];

export default function RegisterUserPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("Field Officer");
  const [tempPassword, setTempPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAutoGeneratePassword() {
    const randomWord = ["Heritage", "Ancient", "Explore", "Ruins"][Math.floor(Math.random() * 4)];
    const randomNum = Math.floor(100 + Math.random() * 900);
    setTempPassword(`${randomWord}@${randomNum}!`);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter the user's full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!tempPassword.trim()) {
      setError("Please enter or generate a temporary password.");
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const users = getUsers();
        // Check if email already exists
        if (users.some(u => u.email.toLowerCase() === email.trim().toLowerCase())) {
          setError("An account with this email already exists.");
          setIsSubmitting(false);
          return;
        }

        const newUser: UserAccount = {
          id: `user-${Date.now()}`,
          fullName: fullName.trim(),
          email: email.trim(),
          role,
          status: "Active"
        };

        saveUsers([...users, newUser]);
        router.push("/admin/dashboard/users");
        router.refresh();
      } catch (err) {
        setError("An error occurred. Please try again.");
        setIsSubmitting(false);
      }
    }, 600);
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
              Create a new user account. No public self-registration is enabled.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4.5">
            <div>
              <label htmlFor="fullName" className="block text-[12px] font-bold text-[#5B6472] uppercase mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. S. Wickramasinghe"
                className="w-full rounded-[6px] border border-[#D4CFC3] px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
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
                placeholder="e.g. s.wick@doa.lk"
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
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="tempPassword" className="block text-[12px] font-bold text-[#5B6472] uppercase mb-1">
                Temporary Password
              </label>
              <div className="flex gap-2 mt-1">
                <input
                  id="tempPassword"
                  type="text"
                  value={tempPassword}
                  onChange={(e) => setTempPassword(e.target.value)}
                  placeholder="Set password or click generate"
                  className="flex-1 rounded-[6px] border border-[#D4CFC3] px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none"
                />
                <button
                  type="button"
                  onClick={handleAutoGeneratePassword}
                  className="rounded-[6px] border border-[#BB892C] text-[#BB892C] px-4 py-2 text-[13px] font-semibold hover:bg-[#FAF6EB]"
                >
                  Generate
                </button>
              </div>
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
