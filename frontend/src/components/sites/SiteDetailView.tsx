import {
  siteAssetUrl,
  SITE_STATUS_LABELS,
  type SiteDetail,
  type SiteStatus,
} from "@/lib/sites";

/**
 * Read-only presentation of a full site record. Shared by the field
 * officer's record detail page and the senior officer's review page.
 * Callers supply their own page header / action controls around it.
 */
export default function SiteDetailView({ site }: { site: SiteDetail }) {
  const lat = Number(site.latitude);
  const lng = Number(site.longitude);

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-2 border-b border-[#DEDBD1]/60 pb-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">{site.name}</h1>
          <p className="mt-0.5 text-[13px] text-[#8A8D86]">
            {site.siteCode} · {site.district} District, {site.province} Province
          </p>
        </div>
        <div className="flex flex-col items-start sm:items-end">
          <span className="text-[11px] font-semibold uppercase text-[#8A8D86]">Status</span>
          <div className="mt-1"><StatusBadge status={site.status} /></div>
        </div>
      </div>

      {site.status === "REJECTED" && site.rejectionReason && (
        <div className="mb-6 rounded-[6px] border border-[#E3B9A8] bg-[#FBF0EB] p-4">
          <h4 className="text-[12.5px] font-bold text-[#8A3A20]">Rejected by senior officer</h4>
          <p className="mt-1 text-[13px] italic leading-relaxed text-[#8A3A20]">
            &ldquo;{site.rejectionReason}&rdquo;
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-5 md:col-span-2">
          <Section title="Description">
            <p className="whitespace-pre-line rounded-[6px] border border-[#DEDBD1]/30 bg-[#FAF9F6] p-4 text-[13.5px] leading-relaxed text-[#5B6472]">
              {site.description || "No description recorded."}
            </p>
          </Section>

          <div className="grid grid-cols-2 gap-4">
            <Detail label="Historical period" value={titleCase(site.historicalPeriod)} />
            <Detail label="Site type" value={titleCase(site.siteType)} />
            <Detail label="Divisional Secretariat" value={site.divisionalSecretariat} />
            <Detail label="GPS coordinates" value={`Lat ${lat.toFixed(5)}, Lng ${lng.toFixed(5)}`} />
            <Detail label="Land use" value={site.landUse} />
            <Detail label="Terrain" value={site.terrain} />
            <Detail label="Distance to river" value={numOrDash(site.distanceToRiver, "km")} />
            <Detail label="Rainfall" value={numOrDash(site.rainfall, "mm/year")} />
            <Detail label="Proximity to development" value={numOrDash(site.proximityToDevelopment, "km")} />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-[#DEDBD1]/60 pt-4">
            <Detail
              label="Registered by"
              value={site.createdBy ? `${site.createdBy.firstName} ${site.createdBy.lastName}` : "—"}
            />
            <Detail label="Created" value={formatDateTime(site.createdAt)} />
            <Detail label="Last updated" value={formatDateTime(site.updatedAt)} />
            {site.submittedAt && <Detail label="Submitted" value={formatDateTime(site.submittedAt)} />}
            {site.approvedAt && <Detail label="Approved" value={formatDateTime(site.approvedAt)} />}
            {site.approvedBy && (
              <Detail
                label="Approved by"
                value={`${site.approvedBy.firstName} ${site.approvedBy.lastName}`}
              />
            )}
            {site.rejectedAt && <Detail label="Rejected" value={formatDateTime(site.rejectedAt)} />}
          </div>
        </div>

        <div className="md:col-span-1">
          <Section title={`Site photographs (${site.photos.length})`}>
            {site.photos.length === 0 ? (
              <div className="flex h-28 w-full items-center justify-center rounded-[6px] border border-dashed border-[#D4CFC3] px-4 text-center text-[11px] text-[#A6A199]">
                No photographs attached
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {site.photos.map((p) => (
                  <a
                    key={p.id}
                    href={siteAssetUrl(p.imageUrl)}
                    target="_blank"
                    rel="noreferrer"
                    className="block"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={siteAssetUrl(p.imageUrl)}
                      alt={p.caption ?? "Site photograph"}
                      className="aspect-square w-full rounded-[6px] border border-[#DEDBD1] object-cover"
                    />
                  </a>
                ))}
              </div>
            )}
          </Section>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[12.5px] font-bold uppercase tracking-wider text-[#3A2A12]">{title}</h3>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <span className="block text-[11px] font-bold uppercase text-[#8A8D86]">{label}</span>
      <span className="text-[13.5px] font-medium text-[#3A4048]">{value}</span>
    </div>
  );
}

export function StatusBadge({ status }: { status: SiteStatus }) {
  const config: Record<SiteStatus, { bg: string; text: string }> = {
    DRAFT: { bg: "#EFEEEA", text: "#5B6472" },
    PENDING: { bg: "#FBF0EB", text: "#9A5A2E" },
    APPROVED: { bg: "#EAF3EA", text: "#2C6B33" },
    REJECTED: { bg: "#FBEBEA", text: "#B03A2E" },
  };
  const { bg, text } = config[status];
  return (
    <span
      className="inline-block rounded-[4px] border border-black/5 px-2.5 py-0.5 text-[12.5px] font-semibold"
      style={{ backgroundColor: bg, color: text }}
    >
      {SITE_STATUS_LABELS[status]}
    </span>
  );
}

function titleCase(v: string) {
  return v ? v.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : "—";
}

function numOrDash(n: number | null, unit: string) {
  return n == null ? "—" : `${n} ${unit}`;
}

function formatDateTime(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-GB", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
