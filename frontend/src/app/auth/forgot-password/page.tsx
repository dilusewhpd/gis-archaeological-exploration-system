"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";

/**
 * Forgot password page — Department of Archaeology GIS Exploration & Risk
 * Assessment System.
 *
 * There is no self-service reset. Submitting this form files a request
 * that only an admin can action (see the admin "Password reset requests"
 * queue). The admin resets the password directly and contacts the user —
 * no token or reset link is ever emailed.
 *
 * Security note: the confirmation state is shown regardless of whether the
 * email matches an account, so this page can't be used to enumerate valid
 * usernames/emails in the system.
 */

const ENDPOINT = "/api/auth/forgot-password";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Enter your work email to continue.");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      // Always show the same confirmation, whether or not the email is
      // registered — this prevents the page from being used to check
      // which addresses belong to real accounts.
      if (res.ok || res.status === 404) {
        setStatus("sent");
        return;
      }

      const body = await res.json().catch(() => null);
      setError(body?.message ?? "Something went wrong. Please try again.");
      setStatus("error");
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setStatus("error");
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#F4F3EF]">
      {/* Top bar — matches the login page */}
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

      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[400px]">
          {status === "sent" ? (
            <ConfirmationCard email={email} />
          ) : (
            <div className="rounded-[10px] border border-[#DEDBD1] bg-white px-8 py-9 shadow-[0_1px_2px_rgba(20,25,33,0.04)]">
              <h1 className="font-serif text-[22px] tracking-tight text-[#16283F]">
                Request password reset
              </h1>
              <p className="mt-2 text-[13px] leading-relaxed text-[#5B6472]">
                We&apos;ll notify your administrator, who will reset your
                password and contact you directly. No link is emailed to you.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-[13px] font-medium text-[#3A4048]"
                  >
                    Work email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="j.perera@doa.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="flex w-full items-center justify-center gap-2 rounded-[6px] bg-[#16283F] px-4 py-2.5 text-[14px] font-medium text-[#F4F2ED] transition hover:bg-[#1D3450] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" && <Spinner />}
                  {status === "submitting" ? "Sending…" : "Send request to admin"}
                </button>
              </form>
            </div>
          )}

          <p className="mt-5 text-center text-[13px]">
            <Link href="/auth/login" className="font-medium text-[#16283F] hover:underline">
              ← Back to login
            </Link>
          </p>
        </div>
      </main>

      <footer className="border-t border-[#DEDBD1] px-6 py-4 text-center text-[11px] text-[#8A8D86]">
        Restricted system. Authorized personnel only. © {new Date().getFullYear()} Department of Archaeology, Sri Lanka.
      </footer>
    </div>
  );
}

function ConfirmationCard({ email }: { email: string }) {
  return (
    <div className="rounded-[10px] border border-[#BFD3C2] bg-[#EFF6F0] px-7 py-8">
      <div className="flex items-start gap-3">
        <CheckIcon />
        <div>
          <p className="text-[14px] font-medium text-[#2C5233]">Request sent</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-[#3C6444]">
            If an account exists for{" "}
            <span className="font-medium">{email.trim() || "that address"}</span>,
            your administrator has been notified and will reach out once your
            password is reset.
          </p>
        </div>
      </div>
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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0">
      <circle cx="12" cy="12" r="9" stroke="#3C6444" strokeWidth="1.6" />
      <path d="M8 12.5l2.5 2.5 5-5.5" stroke="#3C6444" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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