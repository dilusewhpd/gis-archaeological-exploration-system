"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * Login page — Department of Archaeology GIS Exploration & Risk
 * Assessment System.
 *
 * - No self-service registration: accounts are provisioned by an admin
 *   (see /auth/admin/users/new).
 * - "Forgot password" does not email a reset link; it routes to an
 *   admin-mediated request queue (see /auth/forgot-password).
 * - Colors are inline Tailwind arbitrary values, so this file works as a
 *   drop-in with zero tailwind.config changes.
 */

const ENDPOINT = "/auth/login";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Enter your username and password to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (res.status === 423) {
          setError("This account has been disabled. Contact your administrator.");
        } else if (res.status === 401) {
          setError("Incorrect username or password.");
        } else {
          setError(body?.message ?? "Something went wrong. Please try again.");
        }
        return;
      }

      if (typeof window !== "undefined") {
        if (rememberUsername) {
          window.localStorage.setItem("doa_remember_username", username.trim());
        } else {
          window.localStorage.removeItem("doa_remember_username");
        }
      }

      router.push("/field_officer/dashboard");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F3EF]">
      {/* Top bar */}
      <header className="border-b border-[#DEDBD1] bg-[#16283F]">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-3.5">
          <EmblemMark />
          <div className="leading-tight">
            <p className="text-[13px] font-medium tracking-wide text-[#F4F2ED]">
              Department of Archaeology
            </p>
            <p className="text-[11px] text-[#9AA7B6]">Government of Sri Lanka</p>
          </div>
        </div>
      </header>

      {/* Login card */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-8 py-9 shadow-[0_1px_2px_rgba(20,25,33,0.04)]">
            <h1 className="font-serif text-[22px] tracking-tight text-[#16283F]">
              Exploration Management System
            </h1>
            <p className="mt-1.5 text-[13px] text-[#5B6472]">
              Sign in with your department account
            </p>

            <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
              <div>
                <label
                  htmlFor="username"
                  className="block text-[13px] font-medium text-[#3A4048]"
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="j.perera"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#16283F] focus:ring-2 focus:ring-[#16283F]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-[13px] font-medium text-[#3A4048]"
                >
                  Password
                </label>
                <div className="relative mt-1.5">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 pr-10 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#16283F] focus:ring-2 focus:ring-[#16283F]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#8A8478] hover:text-[#5B6472] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#16283F]/20"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#3A4048]">
                  <input
                    type="checkbox"
                    checked={rememberUsername}
                    onChange={(e) => setRememberUsername(e.target.checked)}
                    className="h-4 w-4 rounded border-[#D4CFC3] text-[#16283F] focus:ring-[#16283F]/20"
                  />
                  Remember username
                </label>
                <a
                  href="/auth/forgot-password"
                  className="text-[13px] font-medium text-[#16283F] hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[14px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting && <Spinner />}
                {isSubmitting ? "Signing in…" : "Log in"}
              </button>
            </form>
          </div>

          <p className="mt-5 text-center text-[12px] leading-relaxed text-[#767A72]">
            Accounts are created by your administrator only.
            <br />
            For access or login issues, contact{" "}
            <span className="font-medium text-[#3A4048]">admin@doa.lk</span>.
          </p>
        </div>
      </main>

      <footer className="border-t border-[#DEDBD1] px-6 py-4 text-center text-[11px] text-[#8A8D86]">
        Restricted system. Authorized personnel only. © {new Date().getFullYear()} Department of Archaeology, Sri Lanka.
      </footer>
    </div>
  );
}

function EmblemMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 30 30" aria-hidden="true">
      <circle cx="15" cy="15" r="13.5" fill="none" stroke="#F4F2ED" strokeWidth="1.4" />
      <path
        d="M15 8 L20.5 12.2 V19.5 H9.5 V12.2 Z"
        fill="none"
        stroke="#F4F2ED"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      <circle cx="15" cy="15.5" r="1.6" fill="#F4F2ED" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M6.6 6.7C4.2 8.2 2 12 2 12s3.5 7 10 7c1.9 0 3.5-.4 4.9-1.1M17.5 17.4C20.1 15.8 22 12 22 12s-1.4-2.8-4-4.7"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-[#F4F2ED]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}