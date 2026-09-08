"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ApiError } from "@/lib/api";
import SiteForm from "@/components/sites/SiteForm";
import {
  apiErrorMessage,
  getSite,
  isEditable,
  isSubmittable,
  siteAssetUrl,
  submitSite,
  updateSite,
  uploadSitePhoto,
  type SiteDetail,
  type SiteFormValues,
} from "@/lib/sites";

export default function EditSitePage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.id as string;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = await getSite(siteId);
        if (!isMounted) return;
        if (!isEditable(data.status)) {
          router.replace(`/field_officer/dashboard/records/${siteId}`);
          return;
        }
        setSite(data);
        setLoadError(null);
      } catch (err) {
        if (isMounted) setLoadError(apiErrorMessage(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [siteId, router]);

  async function handleSubmit(
    payload: Record<string, unknown>,
    newPhotos: File[],
    mode: "primary" | "secondary"
  ) {
    setError(null);
    setBusy(true);
    try {
      await updateSite(siteId, payload);

      for (const file of newPhotos) {
        try {
          await uploadSitePhoto(siteId, file);
        } catch (err) {
          setError(
            `Site saved, but a photo failed to upload (${
              err instanceof ApiError ? err.message : "upload failed"
            }). You can retry from the site page.`
          );
        }
      }

      if (mode === "primary" && site && isSubmittable(site.status)) {
        await submitSite(siteId);
      }

      router.push(`/field_officer/dashboard/records/${siteId}`);
      router.refresh();
    } catch (err) {
      setError(apiErrorMessage(err));
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8A8D86]">
        Loading site…
      </div>
    );
  }

  if (loadError || !site) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-medium text-[#B03A2E]">{loadError ?? "Site not found."}</p>
        <Link href="/field_officer/dashboard/records" className="text-[#BB892C] underline">
          Back to records
        </Link>
      </div>
    );
  }

  const initialValues: Partial<SiteFormValues> = {
    siteCode: site.siteCode,
    name: site.name,
    description: site.description ?? "",
    province: site.province,
    district: site.district,
    divisionalSecretariat: site.divisionalSecretariat,
    latitude: Number(site.latitude),
    longitude: Number(site.longitude),
    historicalPeriod: site.historicalPeriod,
    siteType: site.siteType,
    landUse: site.landUse,
    terrain: site.terrain,
    distanceToRiver: site.distanceToRiver?.toString() ?? "",
    rainfall: site.rainfall?.toString() ?? "",
    proximityToDevelopment: site.proximityToDevelopment?.toString() ?? "",
  };

  const canSubmit = isSubmittable(site.status);

  const banner =
    site.status === "REJECTED" && site.rejectionReason ? (
      <div className="mb-6 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] p-4 text-[13px] text-[#8A3A20]">
        <h3 className="font-bold">Rejected by senior officer</h3>
        <p className="mt-1 italic leading-relaxed">&ldquo;{site.rejectionReason}&rdquo;</p>
        <p className="mt-2 text-[12px] not-italic text-[#8A3A20]/80">
          Address the points above, then use “Save &amp; submit for review” to send the
          revised report back to a senior officer.
        </p>
      </div>
    ) : undefined;

  return (
    <SiteForm
      heading={`Edit ${site.name}`}
      initialValues={initialValues}
      primaryLabel={canSubmit ? "Save & submit for review" : undefined}
      secondaryLabel="Save changes"
      banner={banner}
      existingPhotos={site.photos.map((p) => ({
        id: p.id,
        imageUrl: siteAssetUrl(p.imageUrl),
      }))}
      busy={busy}
      error={error}
      onSubmit={handleSubmit}
    />
  );
}
