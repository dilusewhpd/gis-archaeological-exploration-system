"use client";

import {
  useMemo,
  useState,
  type ChangeEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { buildSitePayload, type SiteFormValues } from "@/lib/sites";

/**
 * Shared create/edit form for exploration sites.
 *
 * Field names / types mirror `createSiteSchema` and `updateSiteSchema`
 * (central-backend/src/validators/sites/*). Used by:
 *  - /field_officer/dashboard/new-site
 *  - /field_officer/dashboard/records/[id]/edit
 *
 * MAP NOTE: the coordinate picker is a dependency-free box scaled to Sri
 * Lanka's bounding box, not a tiled map. Swap <CoordinatePicker/> for a real
 * map component when the GIS module lands — it only needs to emit { lat, lng }.
 */

const SL_BOUNDS = { latMin: 5.9, latMax: 9.9, lngMin: 79.5, lngMax: 81.9 };

const SRI_LANKA_POLYGON = [
  { lat: 9.80, lng: 80.20 },
  { lat: 9.30, lng: 80.40 },
  { lat: 8.50, lng: 81.20 },
  { lat: 7.70, lng: 81.80 },
  { lat: 7.00, lng: 81.80 },
  { lat: 6.30, lng: 81.70 },
  { lat: 5.92, lng: 80.60 },
  { lat: 6.20, lng: 80.10 },
  { lat: 6.90, lng: 79.82 },
  { lat: 8.00, lng: 79.70 },
  { lat: 9.00, lng: 79.80 },
  { lat: 9.50, lng: 80.00 },
  { lat: 9.80, lng: 80.20 },
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

const PROVINCES = [
  "Central", "Eastern", "North Central", "Northern", "North Western",
  "Sabaragamuwa", "Southern", "Uva", "Western",
];

const DISTRICTS = [
  "Ampara", "Anuradhapura", "Badulla", "Batticaloa", "Colombo", "Galle",
  "Gampaha", "Hambantota", "Jaffna", "Kalutara", "Kandy", "Kegalle",
  "Kilinochchi", "Kurunegala", "Mannar", "Matale", "Matara", "Monaragala",
  "Mullaitivu", "Nuwara Eliya", "Polonnaruwa", "Puttalam", "Ratnapura",
  "Trincomalee", "Vavuniya",
];

// Exact prisma enum values — do NOT edit the strings.
const HISTORICAL_PERIODS = [
  "PREHISTORIC", "PROTOHISTORIC", "ANURADHAPURA", "POLONNARUWA", "DAMBADENIYA",
  "YAPAHUWA", "KURUNEGALA", "GAMPOLA", "KOTTE", "KANDYAN", "COLONIAL", "MODERN",
];

const SITE_TYPES = [
  "TEMPLE", "STUPA", "MONASTERY", "FORTRESS", "PALACE", "CAVE", "CEMETERY",
  "INSCRIPTION", "RESERVOIR", "MONUMENT", "SETTLEMENT", "OTHER",
];

function toTitleCase(v: string) {
  return v.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

const EMPTY: SiteFormValues = {
  siteCode: "",
  name: "",
  description: "",
  province: "",
  district: "",
  divisionalSecretariat: "",
  latitude: null,
  longitude: null,
  historicalPeriod: "",
  siteType: "",
  landUse: "",
  terrain: "",
  distanceToRiver: "",
  rainfall: "",
  proximityToDevelopment: "",
};

type Coordinates = { lat: number; lng: number };

export interface SiteFormProps {
  heading: string;
  initialValues?: Partial<SiteFormValues>;
  /** Label for the primary (submit-for-review) button. Hidden when omitted. */
  primaryLabel?: string;
  /** Label for the secondary (save) button. Always shown. */
  secondaryLabel: string;
  /** Optional callout rendered above the fields (e.g. a rejection reason). */
  banner?: ReactNode;
  /** Photos already attached to the site (edit mode), shown read-only. */
  existingPhotos?: { id: string; imageUrl: string }[];
  busy?: boolean;
  error?: string | null;
  onSubmit: (
    payload: Record<string, unknown>,
    newPhotos: File[],
    mode: "primary" | "secondary"
  ) => void;
}

export default function SiteForm({
  heading,
  initialValues,
  primaryLabel,
  secondaryLabel,
  banner,
  existingPhotos = [],
  busy = false,
  error,
  onSubmit,
}: SiteFormProps) {
  const [v, setV] = useState<SiteFormValues>({ ...EMPTY, ...initialValues });
  const [coords, setCoords] = useState<Coordinates | null>(
    initialValues?.latitude != null && initialValues?.longitude != null
      ? { lat: initialValues.latitude, lng: initialValues.longitude }
      : null
  );
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  function set<K extends keyof SiteFormValues>(key: K, value: SiteFormValues[K]) {
    setV((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setPhotos((prev) => [...prev, ...files]);
    setPhotoPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = "";
  }

  function removePhoto(index: number) {
    setPhotoPreviews((prev) => {
      const url = prev[index];
      if (url) URL.revokeObjectURL(url);
      return prev.filter((_, i) => i !== index);
    });
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function validate(): string | null {
    if (v.siteCode.trim().length < 3 || v.siteCode.trim().length > 50)
      return "Site code must be between 3 and 50 characters.";
    if (v.name.trim().length < 3 || v.name.trim().length > 255)
      return "Site name must be between 3 and 255 characters.";
    if (!v.province) return "Select a province.";
    if (!v.district) return "Select a district.";
    if (v.divisionalSecretariat.trim().length < 2 || v.divisionalSecretariat.trim().length > 150)
      return "Divisional Secretariat must be between 2 and 150 characters.";
    if (!coords) return "Pick a GPS location on the map, or enter coordinates manually.";
    if (!isPointInPolygon(coords.lat, coords.lng, SRI_LANKA_POLYGON))
      return "The selected coordinate is outside Sri Lanka's land mass (in the ocean). Please select a valid onshore point.";
    if (!v.historicalPeriod) return "Select a historical period.";
    if (!v.siteType) return "Select a site type.";
    if (v.landUse.trim().length < 2 || v.landUse.trim().length > 255)
      return "Land use must be between 2 and 255 characters.";
    if (v.terrain.trim().length < 2 || v.terrain.trim().length > 255)
      return "Terrain must be between 2 and 255 characters.";
    if (v.description.trim().length > 5000)
      return "Description cannot exceed 5000 characters.";
    for (const [label, raw] of [
      ["Distance to river", v.distanceToRiver],
      ["Rainfall", v.rainfall],
      ["Proximity to development", v.proximityToDevelopment],
    ] as const) {
      if (raw.trim() !== "" && (Number.isNaN(Number(raw)) || Number(raw) < 0))
        return `${label} must be a number of 0 or more.`;
    }
    return null;
  }

  function handleClick(e: MouseEvent<HTMLButtonElement>, mode: "primary" | "secondary") {
    e.preventDefault();
    setLocalError(null);
    const problem = validate();
    if (problem) {
      setLocalError(problem);
      return;
    }
    const payload = buildSitePayload({
      ...v,
      latitude: coords!.lat,
      longitude: coords!.lng,
    });
    onSubmit(payload, photos, mode);
  }

  const shownError = localError ?? error ?? null;

  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">{heading}</h1>
      </header>

      <main className="flex-1 px-8 py-7">
        <form noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="rounded-[8px] border border-[#DEDBD1] bg-white px-6 py-6">
            {banner}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="siteCode" label="Site code" required
                placeholder="e.g. SITE-KDY-103"
                value={v.siteCode} onChange={(x) => set("siteCode", x)} />
              <TextField id="name" label="Site name" required
                placeholder="e.g. Sigiriya East ridge"
                value={v.name} onChange={(x) => set("name", x)} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField id="province" label="Province" required
                value={v.province} onChange={(x) => set("province", x)}
                placeholder="Select province"
                options={PROVINCES.map((p) => ({ value: p, label: p }))} />
              <SelectField id="district" label="District" required
                value={v.district} onChange={(x) => set("district", x)}
                placeholder="Select district"
                options={DISTRICTS.map((d) => ({ value: d, label: d }))} />
            </div>

            <div className="mt-4">
              <TextField id="divisionalSecretariat" label="Divisional Secretariat" required
                placeholder="e.g. Dambulla"
                value={v.divisionalSecretariat}
                onChange={(x) => set("divisionalSecretariat", x)} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <SelectField id="historicalPeriod" label="Historical period" required
                value={v.historicalPeriod} onChange={(x) => set("historicalPeriod", x)}
                placeholder="Select period"
                options={HISTORICAL_PERIODS.map((x) => ({ value: x, label: toTitleCase(x) }))} />
              <SelectField id="siteType" label="Site type" required
                value={v.siteType} onChange={(x) => set("siteType", x)}
                placeholder="Select type"
                options={SITE_TYPES.map((x) => ({ value: x, label: toTitleCase(x) }))} />
            </div>

            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField id="landUse" label="Land use" required
                placeholder="e.g. Archaeological Reserve"
                value={v.landUse} onChange={(x) => set("landUse", x)} />
              <TextField id="terrain" label="Terrain" required
                placeholder="e.g. Rocky Foothill"
                value={v.terrain} onChange={(x) => set("terrain", x)} />
            </div>

            <div className="mt-4">
              <label htmlFor="description" className="block text-[13px] font-medium text-[#3A4048]">
                Description <span className="font-normal text-[#8A8D86]">(optional)</span>
              </label>
              <textarea
                id="description"
                rows={4}
                placeholder="Describe the site, visible features, condition…"
                value={v.description}
                onChange={(e) => set("description", e.target.value)}
                className="mt-1.5 w-full resize-none rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
              />
            </div>

            <fieldset className="mt-5 rounded-[6px] border border-[#E7E2D6] px-4 py-3">
              <legend className="px-1 text-[12px] font-medium text-[#8A8D86]">
                Environmental attributes (optional)
              </legend>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <NumberField id="distanceToRiver" label="Distance to river (km)"
                  value={v.distanceToRiver} onChange={(x) => set("distanceToRiver", x)} />
                <NumberField id="rainfall" label="Rainfall (mm/year)"
                  value={v.rainfall} onChange={(x) => set("rainfall", x)} />
                <NumberField id="proximityToDevelopment" label="Proximity to development (km)"
                  value={v.proximityToDevelopment}
                  onChange={(x) => set("proximityToDevelopment", x)} />
              </div>
            </fieldset>

            <div className="mt-5">
              <p className="block text-[13px] font-medium text-[#3A4048]">
                {existingPhotos.length > 0 ? "Add more photographs" : "Site photographs"}{" "}
                <span className="font-normal text-[#8A8D86]">(optional)</span>
              </p>
              <p className="text-[12px] text-[#8A8D86]">JPEG, PNG or WebP · up to 10&nbsp;MB each</p>

              {existingPhotos.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-3">
                  {existingPhotos.map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={p.id}
                      src={p.imageUrl}
                      alt="Existing site photograph"
                      className="h-20 w-20 rounded-[6px] border border-[#DEDBD1] object-cover opacity-90"
                    />
                  ))}
                </div>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3">
                {photoPreviews.map((src, i) => (
                  <div key={src} className="flex flex-col items-center gap-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt={`New site photograph ${i + 1}`}
                      className="h-20 w-20 rounded-[6px] border border-[#DEDBD1] object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="text-[12px] font-medium text-[#B03A2E] hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <label
                  htmlFor="photos"
                  className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-[6px] border border-dashed border-[#D4CFC3] text-[#A6A199] transition hover:border-[#BB892C]/40 hover:text-[#5B6472]"
                >
                  <PlusIcon />
                  <input
                    id="photos"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    multiple
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {shownError && (
              <div
                role="alert"
                className="mt-5 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20]"
              >
                {shownError}
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              {primaryLabel && (
                <button
                  type="button"
                  onClick={(e) => handleClick(e, "primary")}
                  disabled={busy}
                  className="flex-grow flex items-center justify-center gap-2 rounded-[6px] bg-[#BB892C] px-5 py-2.5 text-[14px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busy && <Spinner />}
                  {primaryLabel}
                </button>
              )}
              <button
                type="button"
                onClick={(e) => handleClick(e, "secondary")}
                disabled={busy}
                className="flex-grow flex items-center justify-center gap-2 rounded-[6px] border border-[#D4CFC3] bg-white px-5 py-2.5 text-[14px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {busy && <Spinner />}
                {secondaryLabel}
              </button>
            </div>
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

function TextField({
  id, label, value, onChange, placeholder, required,
}: {
  id: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-[#3A4048]">
        {label}{required && <span className="text-[#B03A2E]"> *</span>}
      </label>
      <input
        id={id}
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
      />
    </div>
  );
}

function NumberField({
  id, label, value, onChange,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[12px] font-medium text-[#5B6472]">{label}</label>
      <input
        id={id}
        type="number"
        min={0}
        step="0.01"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="—"
        className="mt-1 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-2.5 py-2 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
      />
    </div>
  );
}

function SelectField({
  id, label, value, onChange, options, placeholder, required,
}: {
  id: string; label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[]; placeholder: string; required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-[#3A4048]">
        {label}{required && <span className="text-[#B03A2E]"> *</span>}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[14px] text-[#23262B] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function CoordinatePicker({
  value, onChange,
}: {
  value: Coordinates | null;
  onChange: (c: Coordinates) => void;
}) {
  const polygonPointsString = useMemo(() => {
    return SRI_LANKA_POLYGON.map((p) => {
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
      <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
        <polygon
          points={polygonPointsString}
          fill="#F3E9CD"
          stroke="#D5C5A1"
          strokeWidth="1.5"
          className="opacity-80"
        />
        {gridLines.map((_, i) => (
          <line key={`v${i}`}
            x1={`${(i / (gridLines.length - 1)) * 100}%`} y1="0"
            x2={`${(i / (gridLines.length - 1)) * 100}%`} y2="100%"
            stroke="#DEDBD1" strokeWidth={1} strokeDasharray="2,2" />
        ))}
        {gridLines.map((_, i) => (
          <line key={`h${i}`}
            x1="0" y1={`${(i / (gridLines.length - 1)) * 100}%`}
            x2="100%" y2={`${(i / (gridLines.length - 1)) * 100}%`}
            stroke="#DEDBD1" strokeWidth={1} strokeDasharray="2,2" />
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
  label, value, min, max, onChange,
}: {
  label: string; value?: number; min: number; max: number; onChange: (v: number) => void;
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
          const n = parseFloat(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
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
    <svg className="h-4 w-4 animate-spin text-current" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
