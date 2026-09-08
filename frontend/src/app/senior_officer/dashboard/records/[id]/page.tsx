"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import SiteDetailView from "@/components/sites/SiteDetailView";
import {
  apiErrorMessage,
  approveSite,
  getSite,
  rejectSite,
  SITE_STATUS_LABELS,
  type SiteDetail,
} from "@/lib/sites";

const MIN_REASON = 10;

export default function SeniorReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const siteId = params.id as string;

  const [site, setSite] = useState<SiteDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = await getSite(siteId);
        if (isMounted) {
          setSite(data);
          setLoadError(null);
        }
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
  }, [siteId]);

  async function handleApprove() {
    setActionError(null);
    setBusy("approve");
    try {
      await approveSite(siteId);
      router.push("/senior_officer/dashboard");
      router.refresh();
    } catch (err) {
      setActionError(apiErrorMessage(err));
      setBusy(null);
    }
  }

  async function handleReject() {
    setActionError(null);
    if (reason.trim().length < MIN_REASON) {
      setActionError(`The rejection reason must be at least ${MIN_REASON} characters.`);
      return;
    }
    setBusy("reject");
    try {
      await rejectSite(siteId, reason.trim());
      router.push("/senior_officer/dashboard");
      router.refresh();
    } catch (err) {
      setActionError(apiErrorMessage(err));
      setBusy(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center text-[#8A8D86]">
        Loading review…
      </div>
    );
  }

  if (loadError || !site) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-medium text-[#B03A2E]">{loadError ?? "Site record not found."}</p>
        <Link href="/senior_officer/dashboard" className="text-[#BB892C] underline">
          Back to queue
        </Link>
      </div>
    );
  }

  const isPending = site.status === "PENDING";

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div className="flex items-center gap-2">
          <Link href="/senior_officer/dashboard" className="text-[13px] text-[#BB892C] hover:underline">
            &larr; Back to queue
          </Link>
          <span className="font-light text-[#8A8D86]">/</span>
          <span className="text-[13.5px] font-semibold text-[#3A2A12]">
            {isPending ? "Review report" : "Site details"}
          </span>
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-6 bg-[#F0E6C8]/30 px-8 py-7 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs">
          <SiteDetailView site={site} />
        </div>

        <div className="space-y-6">
          <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs">
            <h3 className="border-b border-[#DEDBD1]/60 pb-2 font-serif text-[15.5px] text-[#3A2A12]">
              Review decision
            </h3>

            {isPending ? (
              <div className="mt-4 space-y-3">
                {!rejecting ? (
                  <>
                    <p className="text-[12.5px] text-[#5B6472]">
                      Approving moves this site to <strong>Approved</strong>. Rejecting sends it
                      back to the field officer with your reason.
                    </p>
                    <button
                      type="button"
                      onClick={handleApprove}
                      disabled={busy !== null}
                      className="w-full rounded-[6px] bg-[#2C6B33] py-2 text-[13.5px] font-medium text-[#F4F2ED] transition hover:bg-[#1E4D23] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {busy === "approve" ? "Approving…" : "Approve site"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setRejecting(true)}
                      disabled={busy !== null}
                      className="w-full rounded-[6px] border border-[#B03A2E] py-2 text-[13.5px] font-medium text-[#B03A2E] transition hover:bg-[#FBEBEA] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Reject site…
                    </button>
                  </>
                ) : (
                  <>
                    <label htmlFor="rejectionReason" className="block text-[11.5px] font-bold uppercase text-[#5B6472]">
                      Rejection reason
                    </label>
                    <p className="text-[11px] text-[#8A8D86]">
                      At least {MIN_REASON} characters. The field officer sees this message.
                    </p>
                    <textarea
                      id="rejectionReason"
                      rows={5}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Explain what needs to change before this site can be approved…"
                      className="mt-1 w-full resize-none rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2.5 text-[13px] text-[#23262B] outline-none transition focus:border-[#BB892C] placeholder:text-[#A6A199]"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={busy !== null}
                        className="flex-1 rounded-[6px] bg-[#B03A2E] py-2 text-[13.5px] font-medium text-[#F4F2ED] transition hover:bg-[#8A2418] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {busy === "reject" ? "Rejecting…" : "Confirm rejection"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRejecting(false);
                          setReason("");
                          setActionError(null);
                        }}
                        disabled={busy !== null}
                        className="rounded-[6px] border border-[#D4CFC3] px-4 py-2 text-[13.5px] font-medium text-[#5B6472] transition hover:bg-[#FAF6EB] disabled:opacity-60"
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                )}

                {actionError && (
                  <div role="alert" className="rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3.5 py-2 text-[12.5px] text-[#8A3A20]">
                    {actionError}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 rounded-[6px] border border-[#BB892C]/20 bg-[#FAF6EB] p-4 text-center">
                <span className="block text-[11px] font-bold uppercase text-[#8A8D86]">
                  No action available
                </span>
                <p className="mt-1 text-[12.5px] text-[#3A2A12]">
                  This site is <strong>{SITE_STATUS_LABELS[site.status]}</strong>. Only sites
                  awaiting review can be approved or rejected.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
