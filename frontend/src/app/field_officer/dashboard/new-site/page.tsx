"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import SiteForm from "@/components/sites/SiteForm";
import {
  apiErrorMessage,
  createSite,
  submitSite,
  uploadSitePhoto,
} from "@/lib/sites";

/**
 * New site registration — /field_officer/dashboard/new-site
 *
 *  - "Save as Draft"       -> POST /api/sites                 (creates a DRAFT site)
 *  - "Submit for Approval" -> POST /api/sites, then
 *                             POST /api/sites/:id/submit      (DRAFT -> PENDING)
 *  - Selected photos       -> POST /api/sites/:id/photos      (one request per file)
 */

interface SuccessSummary {
  id: string;
  siteCode: string;
  name: string;
  status: string;
  submitted: boolean;
  photosSelected: number;
  photosUploaded: number;
  photoErrors: string[];
}

export default function NewSitePage() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessSummary | null>(null);
  const [formKey, setFormKey] = useState(0);

  async function handleSubmit(
    payload: Record<string, unknown>,
    photos: File[],
    mode: "primary" | "secondary"
  ) {
    setError(null);
    setBusy(true);
    try {
      const site = await createSite(payload);

      const photoErrors: string[] = [];
      for (const file of photos) {
        try {
          await uploadSitePhoto(site.id, file);
        } catch (err) {
          photoErrors.push(`${file.name}: ${err instanceof ApiError ? err.message : "upload failed"}`);
        }
      }

      let status = site.status;
      let submitted = false;
      if (mode === "primary") {
        const submittedSite = await submitSite(site.id);
        status = submittedSite.status ?? "PENDING";
        submitted = true;
      }

      setSuccess({
        id: site.id,
        siteCode: site.siteCode,
        name: site.name,
        status,
        submitted,
        photosSelected: photos.length,
        photosUploaded: photos.length - photoErrors.length,
        photoErrors,
      });
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
          <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">
            Exploration report saved
          </h1>
        </header>
        <main className="flex-1 px-8 py-7">
          <div className="max-w-[560px] rounded-[8px] border border-[#CFE0CB] bg-[#F3F8F1] px-6 py-6">
            <p className="text-[15px] font-medium text-[#2C6B33]">
              Site “{success.name}” was {success.submitted ? "submitted for approval" : "saved as a draft"}.
            </p>
            <dl className="mt-4 space-y-1.5 text-[13px] text-[#3A4048]">
              <Row label="Site code" value={success.siteCode} />
              <Row label="Site ID" value={<span className="font-mono text-[12px]">{success.id}</span>} />
              <Row label="Status" value={success.status} />
              <Row
                label="Photos"
                value={
                  success.photosSelected === 0
                    ? "None selected"
                    : `${success.photosUploaded} of ${success.photosSelected} uploaded`
                }
              />
            </dl>

            {success.photoErrors.length > 0 && (
              <div className="mt-4 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[12.5px] text-[#8A3A20]">
                <p className="font-medium">Some photos failed to upload:</p>
                <ul className="mt-1 list-disc pl-4">
                  {success.photoErrors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
              </div>
            )}

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  setSuccess(null);
                  setError(null);
                  setFormKey((k) => k + 1);
                }}
                className="rounded-[6px] bg-[#BB892C] px-5 py-2.5 text-[14px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21]"
              >
                Register another site
              </button>
              <Link
                href={`/field_officer/dashboard/records/${success.id}`}
                className="rounded-[6px] border border-[#D4CFC3] bg-white px-5 py-2.5 text-[14px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB]"
              >
                View this site
              </Link>
              <Link
                href="/field_officer/dashboard/records"
                className="rounded-[6px] border border-[#D4CFC3] bg-white px-5 py-2.5 text-[14px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB]"
              >
                Back to my records
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <SiteForm
      key={formKey}
      heading="Submit exploration report"
      primaryLabel="Submit for Approval"
      secondaryLabel="Save as Draft"
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="w-32 text-[#8A8D86]">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
