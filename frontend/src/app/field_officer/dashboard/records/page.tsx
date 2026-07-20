import Link from "next/link";

/**
 * My records — /field_officer/dashboard/records
 *
 * Lists every exploration_record submitted by the signed-in field officer,
 * across the full lifecycle (draft -> submitted -> under_review ->
 * approved | correction_requested -> archived). Filtering and search are
 * done via URL search params so the page stays a server component — no
 * client-side state needed.
 *
 * NOTE: Next.js 15+ makes `searchParams` a Promise in Server Components,
 * so it's awaited below. If you're on an older Next version, drop the
 * `Promise<...>` wrapper and the `await`.
 */

const RECORDS_ENDPOINT = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}/api/field-officer/records`;

type RecordStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "correction_requested"
  | "archived";

type ExplorationRecord = {
  id: string;
  siteName: string;
  district: string | null;
  visitDate: string;
  status: RecordStatus;
  updatedAt: string;
  reviewComments: string | null;
};

const FALLBACK_RECORDS: ExplorationRecord[] = [
  {
    id: "r1",
    siteName: "Anuradhapura North",
    district: "Anuradhapura",
    visitDate: "2026-07-01",
    status: "approved",
    updatedAt: "2026-07-03",
    reviewComments: null,
  },
  {
    id: "r2",
    siteName: "Sigiriya East ridge",
    district: "Matale",
    visitDate: "2026-07-05",
    status: "submitted",
    updatedAt: "2026-07-05",
    reviewComments: null,
  },
  {
    id: "r3",
    siteName: "Polonnaruwa canal site",
    district: "Polonnaruwa",
    visitDate: "2026-07-09",
    status: "correction_requested",
    updatedAt: "2026-07-10",
    reviewComments: "Please add GPS coordinates for the secondary excavation trench.",
  },
  {
    id: "r4",
    siteName: "Yapahuwa terrace",
    district: "Kurunegala",
    visitDate: "2026-06-20",
    status: "draft",
    updatedAt: "2026-06-20",
    reviewComments: null,
  },
  {
    id: "r5",
    siteName: "Ritigala west slope",
    district: "Anuradhapura",
    visitDate: "2026-05-14",
    status: "archived",
    updatedAt: "2026-06-01",
    reviewComments: null,
  },
];

type FilterKey = "all" | "draft" | "in_review" | "approved" | "correction_requested" | "archived";

const FILTERS: { key: FilterKey; label: string; statuses: RecordStatus[] | null }[] = [
  { key: "all", label: "All", statuses: null },
  { key: "draft", label: "Drafts", statuses: ["draft"] },
  { key: "in_review", label: "Pending review", statuses: ["submitted", "under_review"] },
  { key: "approved", label: "Approved", statuses: ["approved"] },
  { key: "correction_requested", label: "Needs correction", statuses: ["correction_requested"] },
  { key: "archived", label: "Archived", statuses: ["archived"] },
];

async function getRecords(status: FilterKey, q: string): Promise<ExplorationRecord[]> {
  try {
    const qs = new URLSearchParams();
    if (status !== "all") qs.set("status", status);
    if (q) qs.set("q", q);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";

    const res = await fetch(`${RECORDS_ENDPOINT}${suffix}`, { cache: "no-store" });
    if (!res.ok) throw new Error("request failed");
    return (await res.json()) as ExplorationRecord[];
  } catch {
    return filterFallback(status, q);
  }
}

function filterFallback(status: FilterKey, q: string): ExplorationRecord[] {
  const filter = FILTERS.find((f) => f.key === status);
  let records = FALLBACK_RECORDS;
  if (filter?.statuses) {
    records = records.filter((r) => filter.statuses!.includes(r.status));
  }
  if (q.trim()) {
    const needle = q.trim().toLowerCase();
    records = records.filter((r) => r.siteName.toLowerCase().includes(needle));
  }
  return records;
}

export default async function MyRecordsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const activeFilter: FilterKey = (FILTERS.some((f) => f.key === params.status)
    ? params.status
    : "all") as FilterKey;
  const query = params.q ?? "";

  const records = await getRecords(activeFilter, query);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">My records</h1>
        <Link
          href="/field_officer/dashboard/new-site"
          className="inline-flex items-center gap-2 rounded-[6px] bg-[#BB892C] px-3.5 py-2 text-[13px] font-medium text-[#F4F2ED] transition hover:bg-[#8F6A21]"
        >
          <PlusIcon />
          Register new site
        </Link>
      </header>

      <main className="flex-1 px-8 py-7">
        {/* Search */}
        <form method="GET" className="mb-4">
          {activeFilter !== "all" && <input type="hidden" name="status" value={activeFilter} />}
          <input
            type="search"
            name="q"
            defaultValue={query}
            placeholder="Search by site name…"
            className="w-full max-w-[320px] rounded-[6px] border border-[#D4CFC3] bg-white px-3.5 py-2 text-[13px] text-[#23262B] placeholder:text-[#A6A199] outline-none transition focus:border-[#BB892C] focus:ring-2 focus:ring-[#BB892C]/10"
          />
        </form>

        {/* Filter tabs */}
        <nav className="mb-5 flex flex-wrap gap-1.5" aria-label="Filter records by status">
          {FILTERS.map((f) => {
            const href = buildFilterHref(f.key, query);
            const isActive = f.key === activeFilter;
            return (
              <Link
                key={f.key}
                href={href}
                aria-current={isActive ? "page" : undefined}
                className={
                  "rounded-full px-3 py-1.5 text-[12.5px] font-medium transition " +
                  (isActive
                    ? "bg-[#BB892C] text-[#F4F2ED]"
                    : "border border-[#DEDBD1] bg-white text-[#5B6472] hover:border-[#BB892C]/40 hover:text-[#BB892C]")
                }
              >
                {f.label}
              </Link>
            );
          })}
        </nav>

        {/* Table */}
        <div className="overflow-hidden rounded-[8px] border border-[#DEDBD1] bg-white">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="bg-[#3A2A12] text-[#F4F2ED]">
                <th className="px-4 py-2.5 font-medium">Site name</th>
                <th className="px-4 py-2.5 font-medium">District</th>
                <th className="px-4 py-2.5 font-medium">Visit date</th>
                <th className="px-4 py-2.5 font-medium">Status</th>
                <th className="px-4 py-2.5 font-medium">Last updated</th>
                <th className="px-4 py-2.5 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#8A8D86]">
                    No records match this filter.
                  </td>
                </tr>
              ) : (
                records.map((r, i) => (
                  <tr key={r.id} className={i % 2 === 1 ? "bg-[#FAF9F6]" : undefined}>
                    <td className="px-4 py-2.5 text-[#23262B]">{r.siteName}</td>
                    <td className="px-4 py-2.5 text-[#5B6472]">{r.district ?? "—"}</td>
                    <td className="px-4 py-2.5 text-[#5B6472]">{formatDate(r.visitDate)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={r.status} />
                      {r.status === "correction_requested" && r.reviewComments && (
                        <p className="mt-1 max-w-[220px] text-[11.5px] leading-snug text-[#B03A2E]">
                          {r.reviewComments}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-[#5B6472]">{formatDate(r.updatedAt)}</td>
                    <td className="px-4 py-2.5 text-right">
                      <RecordAction record={r} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

function buildFilterHref(key: FilterKey, q: string) {
  const params = new URLSearchParams();
  if (key !== "all") params.set("status", key);
  if (q.trim()) params.set("q", q.trim());
  const qs = params.toString();
  return `/field_officer/dashboard/records${qs ? `?${qs}` : ""}`;
}

function RecordAction({ record }: { record: ExplorationRecord }) {
  if (record.status === "draft") {
    return (
      <Link
        href={`/field_officer/dashboard/records/${record.id}/edit`}
        className="text-[13px] font-medium text-[#BB892C] hover:underline"
      >
        Continue editing
      </Link>
    );
  }
  return (
    <Link
      href={`/field_officer/dashboard/records/${record.id}`}
      className="text-[13px] font-medium text-[#BB892C] hover:underline"
    >
      View
    </Link>
  );
}

function StatusBadge({ status }: { status: RecordStatus }) {
  const config: Record<RecordStatus, { label: string; bg: string; text: string }> = {
    draft: { label: "Draft", bg: "#EFEEEA", text: "#5B6472" },
    submitted: { label: "Submitted", bg: "#FBF0EB", text: "#9A5A2E" },
    under_review: { label: "Under review", bg: "#FBF0EB", text: "#9A5A2E" },
    approved: { label: "Approved", bg: "#EAF3EA", text: "#2C6B33" },
    correction_requested: { label: "Correction requested", bg: "#FBEBEA", text: "#B03A2E" },
    archived: { label: "Archived", bg: "#EFEEEA", text: "#767A72" },
  };
  const { label, bg, text } = config[status];

  return (
    <span
      className="inline-block rounded-[4px] px-2 py-0.5 text-[12px] font-medium"
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}