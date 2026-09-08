"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SiteDetailView from "@/components/sites/SiteDetailView";
import SiteHistoryTimeline from "@/components/sites/SiteHistoryTimeline";
import {
  apiErrorMessage,
  getSite,
  isEditable,
  isSubmittable,
  submitSite,
  type SiteDetail,
} from "@/lib/sites";

export default function RecordDetailPage() {
  const params = useParams();
  const siteId = params.id as string;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionNote, setActionNote] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = await getSite(siteId);
        if (isMounted) {
          setSite(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(apiErrorMessage(err));
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  async function handleSubmitForReview() {
    setActionError(null);
    setActionNote(null);
    setSubmitting(true);
    try {
      const updated = await submitSite(siteId);
      setSite(updated);
      setActionNote("Site submitted for review. It is now pending a senior officer's decision.");
    } catch (err) {
      setActionError(apiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  function handlePrint() {
    if (typeof window !== "undefined") window.print();
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8A8D86]">
        Loading site record…
      </div>
    );
  }

  if (error || !site) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-medium text-[#B03A2E]">{error ?? "Site record not found."}</p>
        <Link href="/field_officer/dashboard/records" className="text-[#BB892C] underline">
          Back to records
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4 print:hidden">
        <div className="flex items-center gap-2">
          <Link href="/field_officer/dashboard/records" className="text-[13px] text-[#BB892C] hover:underline">
            &larr; Back to records
          </Link>
          <span className="font-light text-[#8A8D86]">/</span>
          <span className="text-[13.5px] font-semibold text-[#3A2A12]">Site details</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {isEditable(site.status) && (
            <Link
              href={`/field_officer/dashboard/records/${site.id}/edit`}
              className="rounded-[6px] border border-[#D4CFC3] bg-white px-4 py-2 text-[13px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB]"
            >
              Edit
            </Link>
          )}
          {isSubmittable(site.status) && (
            <button
              type="button"
              onClick={handleSubmitForReview}
              disabled={submitting}
              className="rounded-[6px] bg-[#BB892C] px-4 py-2 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit for review"}
            </button>
          )}
          <button
            onClick={handlePrint}
            className="rounded-[6px] border border-[#D4CFC3] bg-white px-4 py-2 text-[13px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB]"
          >
            Print
          </button>
        </div>
      </header>

      <main className="flex-1 bg-[#F0E6C8]/30 px-8 py-7 print:bg-white print:p-0">
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-8 shadow-xs print:border-none print:shadow-none">
            {actionNote && (
              <div className="mb-5 rounded-[6px] border border-[#CFE0CB] bg-[#F3F8F1] px-3.5 py-2.5 text-[13px] text-[#2C6B33] print:hidden">
                {actionNote}
              </div>
            )}
            {actionError && (
              <div className="mb-5 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2.5 text-[13px] text-[#8A3A20] print:hidden">
                {actionError}
              </div>
            )}

            <SiteDetailView site={site} />

            <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#DEDBD1]/60 pt-4 text-[11px] text-[#8A8D86] sm:flex-row">
              <span>Report generated on {new Date().toLocaleDateString("en-GB")}</span>
              <span>Department of Archaeology, Colombo, Sri Lanka</span>
            </div>
          </div>

          <SiteHistoryTimeline siteId={site.id} />
        </div>
      </main>
    </div>
  );
}
