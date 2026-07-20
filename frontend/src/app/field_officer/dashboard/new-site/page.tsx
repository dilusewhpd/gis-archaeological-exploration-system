"use client";

import { useMemo, useState, type ChangeEvent, type FormEvent, type MouseEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * New site registration — /field_officer/dashboard/new-site
 *
 * Covers the "Register new exploration site" use case:
 *  - <<include>> Record GPS location  -> the coordinate picker below
 *  - <<extends>> Upload site photograph -> optional single photo
 *
 * MAP NOTE: this uses a lightweight, dependency-free coordinate picker
 * scaled to Sri Lanka's real bounding box, NOT a real tiled map. When the
 * GIS Visualization module is built (Leaflet/Mapbox + PostGIS), swap the
 * <CoordinatePicker /> below for a real map component — the rest of this
 * page (state, submit handler, validation) doesn't need to change, since
 * both only need to produce a { lat, lng } pair.
 */

// Sri Lanka's approximate onshore bounding box (WGS84)
const SL_BOUNDS = { latMin: 5.9, latMax: 9.9, lngMin: 79.5, lngMax: 81.9 };

const SRI_LANKA_POLYGON = [
  { lat: 9.80, lng: 80.20 }, // Jaffna
  { lat: 9.30, lng: 80.40 }, // Northeast (Mullaitivu)
  { lat: 8.50, lng: 81.20 }, // Trincomalee
  { lat: 7.70, lng: 81.80 }, // Batticaloa
  { lat: 7.00, lng: 81.80 }, // East coast
  { lat: 6.30, lng: 81.70 }, // Southeast (Yala)
  { lat: 5.92, lng: 80.60 }, // Dondra (South)
  { lat: 6.20, lng: 80.10 }, // Galle
  { lat: 6.90, lng: 79.82 }, // Colombo
  { lat: 8.00, lng: 79.70 }, // Kalpitiya
  { lat: 9.00, lng: 79.80 }, // Mannar
  { lat: 9.50, lng: 80.00 }, // Pooneryn
  { lat: 9.80, lng: 80.20 }, // Close loop
];

function isPointInPolygon(lat: number, lng: number, polygon: { lat: number; lng: number }[]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng, yi = polygon[i].lat;
    const xj = polygon[j].lng, yj = polygon[j].lat;

    const intersect = ((yi > lat) !== (yj > lat))
        && (lng < (xj - xi) * (lat - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

const ENDPOINT = "/api/exploration-sites";

type Coordinates = { lat: number; lng: number };

export default function NewSitePage() {
  const router = useRouter();

  const [siteName, setSiteName] = useState("");
  const [district, setDistrict] = useState("");
  const [notes, setNotes] = useState("");
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setPhoto(file);
    setPhotoPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return file ? URL.createObjectURL(file) : null;
    });
  }

  function removePhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhoto(null);
    setPhotoPreview(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!siteName.trim()) {
      setError("Enter a site name.");
      return;
    }
    if (!coords) {
      setError("Pick a GPS location on the map, or enter coordinates manually.");
      return;
    }
    if (!isPointInPolygon(coords.lat, coords.lng, SRI_LANKA_POLYGON)) {
      setError("The selected coordinate is outside Sri Lanka's land mass (in the ocean). Please select a valid onshore point.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", siteName.trim());
      formData.append("district", district);
      formData.append("notes", notes);
      formData.append("lat", String(coords.lat));
      formData.append("lng", String(coords.lng));
      if (photo) formData.append("photo", photo);

      const res = await fetch(ENDPOINT, { method: "POST", body: formData });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setError(body?.message ?? "Couldn't submit the site. Please try again.");
        return;
      }

      router.push("/field_officer/dashboard/records");
      router.refresh();
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">
          Submit exploration report
        </h1>
      </header>

      <main className="flex-1 px-8 py-7">
        <form onSubmit={handleSubmit} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* Left: form fields */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-6 py-6">
            <div>
              <label htmlFor="siteName" className="block text-[13px] font-medium text-[#3A4048]">
                Site name
              </label>
              <input
                id="siteName"
                type="text"
                placeholder="e.g. Sigiriya East ridge"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
            </div>

            <div className="mt-4">
              <label htmlFor="district" className="block text-[13px] font-medium text-[#3A4048]">
                District
              </label>
              <select
                id="district"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              >
                <option value="">Select district</option>
                {DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <label htmlFor="notes" className="block text-[13px] font-medium text-[#3A4048]">
                Exploration notes
              </label>
              <textarea
                id="notes"
                rows={5}
                placeholder="Describe the site, visible features, condition…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1.5 w-full resize-none rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
            </div>

            <div className="mt-4">
              <p className="block text-[13px] font-medium text-[#3A4048]">
                Upload site photograph
              </p>
              <p className="text-[12px] text-[#8A8D86]">Optional</p>

              {photoPreview ? (
                <div className="mt-2 flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoPreview}
                    alt="Selected site photograph preview"
                    className="h-20 w-20 rounded-[6px] border border-[#DEDBD1] object-cover"
                  />
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="text-[13px] font-medium text-[#B03A2E] hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="photo"
                  className="mt-2 flex h-20 w-20 cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[#D4CFC3] text-[#A6A199] transition hover:border-[#BB892C]/40 hover:text-[#5B6472]"
                >
                  <PlusIcon />
                  <input
                    id="photo"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {error && (
              <div
                role="alert"
                className="mt-5 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-6 flex items-center justify-center gap-2 rounded-[6px] bg-[#BB892C] px-5 py-2.5 text-[14px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting && <Spinner />}
              {isSubmitting ? "Submitting…" : "Submit exploration report"}
            </button>
          </div>

          {/* Right: GPS location picker */}
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-5 py-5">
            <p className="text-[13px] font-medium text-[#3A4048]">GPS location</p>
            <p className="mt-0.5 text-[12px] text-[#8A8D86]">
              Click on the map to set the site&apos;s coordinates.
            </p>

            <CoordinatePicker value={coords} onChange={setCoords} />

            {coords && (
              <div className="mt-3 rounded-[6px] bg-[#FAF6EB] p-2.5 text-[11px] text-[#8F6A21]">
                <span className="font-semibold">GPS Quality/Confidence (simulated):</span>{" "}
                {isPointInPolygon(coords.lat, coords.lng, SRI_LANKA_POLYGON) ? (
                  <span className="text-[#2C6B33]">Excellent Accuracy (±3.2m simulated) • HDOP 1.1 (9 Satellites)</span>
                ) : (
                  <span className="text-[#B03A2E]">Outside Land Territory (Ocean detected)</span>
                )}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-3">
              <ManualCoordField
                label="Latitude"
                value={coords?.lat}
                min={SL_BOUNDS.latMin}
                max={SL_BOUNDS.latMax}
                onChange={(lat) =>
                  setCoords((prev) => ({ lat, lng: prev?.lng ?? (SL_BOUNDS.lngMin + SL_BOUNDS.lngMax) / 2 }))
                }
              />
              <ManualCoordField
                label="Longitude"
                value={coords?.lng}
                min={SL_BOUNDS.lngMin}
                max={SL_BOUNDS.lngMax}
                onChange={(lng) =>
                  setCoords((prev) => ({ lng, lat: prev?.lat ?? (SL_BOUNDS.latMin + SL_BOUNDS.latMax) / 2 }))
                }
              />
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}

function CoordinatePicker({
  value,
  onChange,
}: {
  value: Coordinates | null;
  onChange: (c: Coordinates) => void;
}) {
  const polygonPointsString = useMemo(() => {
    return SRI_LANKA_POLYGON.map(p => {
      const xPct = ((p.lng - SL_BOUNDS.lngMin) / (SL_BOUNDS.lngMax - SL_BOUNDS.lngMin)) * 100;
      const yPct = ((SL_BOUNDS.latMax - p.lat) / (SL_BOUNDS.latMax - SL_BOUNDS.latMin)) * 100;
      return `${xPct.toFixed(1)},${yPct.toFixed(1)}`;
    }).join(" ");
  }, []);

  const gridLines = useMemo(() => Array.from({ length: 6 }), []);

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const xRatio = (e.clientX - rect.left) / rect.width;
    const yRatio = (e.clientY - rect.top) / rect.height;

    const lng = SL_BOUNDS.lngMin + xRatio * (SL_BOUNDS.lngMax - SL_BOUNDS.lngMin);
    // y grows downward on screen, latitude grows upward — invert.
    const lat = SL_BOUNDS.latMax - yRatio * (SL_BOUNDS.latMax - SL_BOUNDS.latMin);

    onChange({
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
    });
  }

  const markerPos = value && {
    xPct: ((value.lng - SL_BOUNDS.lngMin) / (SL_BOUNDS.lngMax - SL_BOUNDS.lngMin)) * 100,
    yPct: ((SL_BOUNDS.latMax - value.lat) / (SL_BOUNDS.latMax - SL_BOUNDS.latMin)) * 100,
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Click to set the site's GPS coordinates"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          onChange({
            lat: (SL_BOUNDS.latMin + SL_BOUNDS.latMax) / 2,
            lng: (SL_BOUNDS.lngMin + SL_BOUNDS.lngMax) / 2,
          });
        }
      }}
      className="relative mt-3 aspect-[3/4] w-full cursor-crosshair overflow-hidden rounded-[6px] border border-[#DEDBD1] bg-[#FAF6EB]"
    >
      {/* grid */}
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        {/* Sri Lanka landmass outline */}
        <polygon
          points={polygonPointsString}
          fill="#F3E9CD"
          stroke="#D5C5A1"
          strokeWidth="1.5"
          className="opacity-80"
        />
        {gridLines.map((_, i) => (
          <line
            key={`v${i}`}
            x1={`${(i / (gridLines.length - 1)) * 100}%`}
            y1="0"
            x2={`${(i / (gridLines.length - 1)) * 100}%`}
            y2="100%"
            stroke="#DEDBD1"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        ))}
        {gridLines.map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={`${(i / (gridLines.length - 1)) * 100}%`}
            x2="100%"
            y2={`${(i / (gridLines.length - 1)) * 100}%`}
            stroke="#DEDBD1"
            strokeWidth={1}
            strokeDasharray="2,2"
          />
        ))}
      </svg>

      {!markerPos && (
        <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-[12px] text-[#A6A199]">
          Click anywhere to drop a pin
        </p>
      )}

      {markerPos && (
        <div
          className="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[#9A4B2E] shadow-[0_0_0_1px_rgba(154,75,46,0.4)]"
          style={{ left: `${markerPos.xPct}%`, top: `${markerPos.yPct}%` }}
        />
      )}
    </div>
  );
}

function ManualCoordField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value?: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="block text-[12px] text-[#5B6472]">{label}</label>
      <input
        type="number"
        step="0.0001"
        min={min}
        max={max}
        value={value ?? ""}
        onChange={(e) => {
          const v = parseFloat(e.target.value);
          if (!Number.isNaN(v)) onChange(v);
        }}
        placeholder="—"
        className="mt-1 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-2.5 py-1.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
      />
    </div>
  );
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin text-[#F4F2ED]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}