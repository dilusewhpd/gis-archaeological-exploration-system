"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { SITE_STATUS_LABELS, STATUS_COLOR, type SiteListItem } from "@/lib/sites";
import { toTitleCase } from "@/lib/sri-lanka";

/**
 * Real OpenStreetMap tiles via react-leaflet (replaces the earlier
 * dependency-free SVG projection). Every marker gets a custom colored
 * divIcon, so Leaflet's default marker image (broken under bundlers
 * unless manually reconfigured) is never referenced.
 */

const SRI_LANKA_CENTER: [number, number] = [7.87, 80.77];
const DEFAULT_ZOOM = 8;

function markerIcon(color: string, selected: boolean) {
  const size = selected ? 20 : 13;
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:${color};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.45);"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2],
  });
}

export default function LeafletMap({
  sites,
  selectedId,
  onSelect,
  detailHref,
}: {
  sites: SiteListItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  detailHref: (id: string) => string | null;
}) {
  return (
    <MapContainer
      center={SRI_LANKA_CENTER}
      zoom={DEFAULT_ZOOM}
      minZoom={6}
      maxZoom={18}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {sites.map((s) => {
        const lat = Number(s.latitude);
        const lng = Number(s.longitude);
        const href = detailHref(s.id);
        return (
          <Marker
            key={s.id}
            position={[lat, lng]}
            icon={markerIcon(STATUS_COLOR[s.status], s.id === selectedId)}
            eventHandlers={{ click: () => onSelect(s.id) }}
          >
            <Popup minWidth={200}>
              <div className="min-w-[180px]">
                <p className="text-[13.5px] font-bold leading-tight text-[#3A2A12]">
                  {s.name}
                </p>
                <span className="font-mono text-[10.5px] text-[#8A8D86]">{s.siteCode}</span>

                <dl className="mt-2 space-y-1 text-[11.5px] text-[#5B6472]">
                  <div className="flex justify-between gap-2">
                    <dt>Status</dt>
                    <dd className="font-semibold" style={{ color: STATUS_COLOR[s.status] }}>
                      {SITE_STATUS_LABELS[s.status]}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>Type</dt>
                    <dd className="font-medium text-[#3A4048]">{toTitleCase(s.siteType)}</dd>
                  </div>
                  <div className="flex justify-between gap-2">
                    <dt>District</dt>
                    <dd className="font-medium text-[#3A4048]">{s.district}</dd>
                  </div>
                </dl>

                {href && (
                  <Link
                    href={href}
                    className="mt-2 block text-[12px] font-medium text-[#BB892C] hover:underline"
                  >
                    View full details &rarr;
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
