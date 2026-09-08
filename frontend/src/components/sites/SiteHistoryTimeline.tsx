"use client";

import { useEffect, useState } from "react";
import {
  apiErrorMessage,
  getSiteHistory,
  type SiteWorkflowAction,
  type WorkflowHistoryEntry,
} from "@/lib/sites";

/**
 * Workflow audit trail for a site — GET /api/sites/:id/history.
 * Self-contained: fetches its own data so both the field officer and
 * senior officer detail pages can drop it in with just a siteId.
 *
 * Entries render oldest-first (the order the endpoint returns).
 */
export default function SiteHistoryTimeline({ siteId }: { siteId: string }) {
  const [entries, setEntries] = useState<WorkflowHistoryEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      try {
        const data = await getSiteHistory(siteId);
        if (isMounted) {
          setEntries(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) setError(apiErrorMessage(err));
      }
    };
    void run();
    return () => {
      isMounted = false;
    };
  }, [siteId]);

  return (
    <section className="rounded-[10px] border border-[#DEDBD1] bg-white p-6 shadow-xs">
      <h3 className="text-[12.5px] font-bold uppercase tracking-wider text-[#3A2A12]">
        Workflow history
      </h3>

      {error ? (
        <p className="mt-3 text-[13px] text-[#8A3A20]">{error}</p>
      ) : entries === null ? (
        <p className="mt-3 text-[13px] text-[#8A8D86]">Loading history…</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-[13px] text-[#8A8D86]">No workflow events recorded yet.</p>
      ) : (
        <ol className="mt-4 space-y-0">
          {entries.map((entry, i) => (
            <li key={entry.id} className="relative flex gap-3 pb-5 last:pb-0">
              {/* connector line */}
              {i < entries.length - 1 && (
                <span
                  aria-hidden="true"
                  className="absolute left-[5px] top-3 h-full w-px bg-[#DEDBD1]"
                />
              )}
              <span
                aria-hidden="true"
                className="z-10 mt-1 h-[11px] w-[11px] shrink-0 rounded-full border border-white"
                style={{ backgroundColor: actionColor(entry.action) }}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-x-2">
                  <span
                    className="text-[12.5px] font-bold uppercase tracking-wide"
                    style={{ color: actionColor(entry.action) }}
                  >
                    {ACTION_LABELS[entry.action] ?? entry.action}
                  </span>
                  <span className="text-[12px] text-[#8A8D86]">
                    {formatDateTime(entry.createdAt)}
                  </span>
                </div>
                <p className="text-[12.5px] text-[#5B6472]">
                  by{" "}
                  {entry.performedBy
                    ? `${entry.performedBy.firstName} ${entry.performedBy.lastName}`
                    : "Unknown user"}
                </p>
                {entry.remarks && (
                  <p className="mt-1.5 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] px-3 py-2 text-[12.5px] italic leading-relaxed text-[#8A3A20]">
                    &ldquo;{entry.remarks}&rdquo;
                  </p>
                )}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

const ACTION_LABELS: Record<SiteWorkflowAction, string> = {
  CREATED: "Created",
  UPDATED: "Updated",
  SUBMITTED: "Submitted for review",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  ARCHIVED: "Archived",
};

function actionColor(action: SiteWorkflowAction): string {
  switch (action) {
    case "CREATED":
      return "#BB892C";
    case "SUBMITTED":
      return "#9A5A2E";
    case "APPROVED":
      return "#2C6B33";
    case "REJECTED":
      return "#B03A2E";
    case "UPDATED":
    case "ARCHIVED":
    default:
      return "#5B6472";
  }
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
