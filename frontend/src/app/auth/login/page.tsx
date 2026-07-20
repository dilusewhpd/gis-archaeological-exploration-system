"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * Login page — Exploration Data Management System
 * Department of Archaeology, Sri Lanka
 *
 * Layout: left panel is an auto-rotating image carousel with an
 * overlay caption; right panel is the sign-in form.
 *
 * - No self-service registration: accounts are provisioned by an admin
 *   (see /auth/admin/users/new).
 * - "Forgot password" does not email a reset link; it routes to an
 *   admin-mediated request queue (see /auth/forgot-password).
 */

const ENDPOINT = "/auth/login";

// ---------------------------------------------------------------------
// CAROUSEL SLIDES — put your files in /public/images/ and list them here.
// Because they live in /public, the path starts at "/", NOT "/public/...".
//   e.g. a file saved at   public/images/carousel-1.jpg
//   is referenced here as  "/images/carousel-1.jpg"
//
// Each slide now carries its own title + caption so the overlay text
// changes together with the image as the carousel advances.
// ---------------------------------------------------------------------
const SLIDES = [
  {
    src: "/images/carousel-1.jpg",
    alt: "Archaeological excavation site survey",
    title: "Exploration Data Management System",
    caption:
      "Digitising exploration records, spatial data, and risk assessment for archaeological sites across Sri Lanka.",
  },
  {
    src: "/images/carousel-2.jpg",
    alt: "Ancient stone ruins mapped by the department",
    title: "Mapping Sri Lanka's Heritage",
    caption:
      "Centralising site surveys and monument records to support long-term conservation planning.",
  },
  {
    src: "/images/carousel-3.jpg",
    alt: "Field officer recording a heritage site",
    title: "Field Data, Digitised",
    caption:
      "Supporting field officers with structured, standardised data capture from every site visit.",
  },
];

const AUTOPLAY_MS = 5500;

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberUsername, setRememberUsername] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(() => {
      setSlide((s) => (s + 1) % SLIDES.length);
    }, AUTOPLAY_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [paused]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!username.trim() || !password) {
      setError("Enter your username and password to continue.");
      return;
    }

    setIsSubmitting(true);
    try {
      // Mock bypass for development/wireframing
      const lowerUser = username.trim().toLowerCase();
      let mockRole: "admin" | "analyst" | "field_officer" | null = null;
      
      if (lowerUser === "admin" || lowerUser === "n.fernando") {
        mockRole = "admin";
      } else if (lowerUser === "analyst" || lowerUser === "k.silva") {
        mockRole = "analyst";
      } else if (lowerUser === "officer" || lowerUser === "j.perera" || lowerUser === "r.bandara") {
        mockRole = "field_officer";
      }

      if (mockRole) {
        // Simulate network delay for realistic feel
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        if (typeof window !== "undefined") {
          if (rememberUsername) {
            window.localStorage.setItem("doa_remember_username", username.trim());
          } else {
            window.localStorage.removeItem("doa_remember_username");
          }
        }
        
        router.push(`/${mockRole}/dashboard`);
        router.refresh();
        return;
      }

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

  const current = SLIDES[slide];

  return (
    <div className="flex min-h-screen bg-[#F0E6C8]">
      {/* ---------------- LEFT: image carousel ---------------- */}
      <div
        className="relative hidden w-[56%] overflow-hidden bg-[#3B2A14] lg:block"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {SLIDES.map((s, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={s.src}
            src={s.src}
            alt={s.alt}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-[1200ms] ease-out ${
              i === slide ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}

        {/* darken for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#241708]/85 via-[#241708]/15 to-[#241708]/35" />

        {/* faint survey graticule, the one signature flourish */}
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
          aria-hidden="true"
        >
          <defs>
            <pattern id="grid" width="64" height="64" patternUnits="userSpaceOnUse">
              <path d="M 64 0 L 0 0 0 64" fill="none" stroke="#F4F2ED" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* corner survey marks */}
        <CornerMark className="left-6 top-6" />
        <CornerMark className="right-6 top-6 rotate-90" />
        <CornerMark className="bottom-6 left-6 -rotate-90" />
        <CornerMark className="bottom-6 right-6 rotate-180" />

        {/* overlay caption — now driven by the active slide */}
        <div className="absolute inset-x-0 bottom-0 px-12 pb-14 pt-24">
          <p className="text-[15px] font-medium font-weight-[1000] uppercase bold tracking-[0.18em] text-[#FAC437]">
            Department of Archaeology · Sri Lanka
          </p>

          <h1
            key={`title-${slide}`}
            className="mt-3 max-w-md font-serif text-[32px] leading-[1.15] text-[#F4F2ED] animate-[captionFade_0.7s_ease]"
          >
            {current.title}
          </h1>
          <p
            key={`caption-${slide}`}
            className="mt-3 max-w-sm text-[13px] leading-relaxed text-[#E4D9BE] animate-[captionFade_0.7s_ease]"
          >
            {current.caption}
          </p>

          {/* scale-bar style progress indicator */}
          <div className="mt-8 flex items-center gap-3">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show slide ${i + 1}`}
                onClick={() => setSlide(i)}
                className="group flex flex-col items-center gap-1"
              >
                <span
                  className={`h-[3px] rounded-full transition-all duration-300 ${
                    i === slide
                      ? "w-10 bg-[#D9A05B]"
                      : "w-5 bg-[#F4F2ED]/35 group-hover:bg-[#F4F2ED]/60"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---------------- RIGHT: login form ---------------- */}
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-[380px]">
          <div className="mb-8 lg:hidden">
            <p className="text-[15px] font-medium font-weight-[1000] uppercase bold tracking-[0.18em] text-[#FAC437]">
              Department of Archaeology · Sri Lanka
            </p>
          </div>

          <h2 className="font-serif text-[32px] tracking-tight text-[#BB892C]">
            Sign in
          </h2>
          <p className="mt-1.5 text-[13px] text-[#5B6472]">
            Use your department account to continue
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
                className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
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
                  className="w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 pr-10 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-[#8A8478] hover:text-[#5B6472] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#BB892C]/20"
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
                  className="h-4 w-4 rounded border-[#D4CFC3] accent-[#BB892C] text-[#BB892C] focus:ring-[#BB892C]/20 "
                />
                Remember username
              </label>
              <a
                href="/auth/forgot-password"
                className="text-[13px] font-medium text-[#BB892C] hover:underline"
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
              className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-[#BB892C] px-4 py-2.5 text-[14px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Signing in…" : "Log in"}
            </button>
          </form>

          <p className="mt-6 text-center text-[12px] leading-relaxed text-[#767A72]">
            Accounts are created by your administrator only.
            <br />
            For access or login issues, contact{" "}
            <span className="font-medium text-[#3A4048]">admin@doa.lk</span>.
          </p>
        </div>
      </main>

      {/* keyframes for the caption fade-in on slide change */}
      <style jsx global>{`
        @keyframes captionFade {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function CornerMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`absolute h-5 w-5 text-[#F4F2ED]/70 ${className}`}
      aria-hidden="true"
    >
      <path d="M2 10V2h8" fill="none" stroke="currentColor" strokeWidth="1.4" />
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