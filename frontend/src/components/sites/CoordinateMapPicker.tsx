"use client";

import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

/**
 * Real OpenStreetMap tiles via react-leaflet — the same tile source and
 * custom-icon approach as GisMapView's LeafletMap, but scoped to a single
 * draggable marker instead of a whole site list. Click or drag to set the
 * form's { lat, lng }; land/sea validation stays in SiteForm (this
 * component only reports where the user pointed).
 */

const SRI_LANKA_CENTER: [number, number] = [7.87, 80.77];
const DEFAULT_ZOOM = 8;
const SELECTED_ZOOM = 11;

type Coordinates = { lat: number; lng: number };

const markerIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#9A4B2E;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.45);"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function round(n: number): number {
  return Math.round(n * 10000) / 10000;
}

function ClickHandler({ onChange }: { onChange: (c: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      onChange({ lat: round(e.latlng.lat), lng: round(e.latlng.lng) });
    },
  });
  return null;
}

export default function CoordinateMapPicker({
  value,
  onChange,
}: {
  value: Coordinates | null;
  onChange: (c: Coordinates) => void;
}) {
  return (
    <div className="relative mt-3 aspect-[3/4] w-full overflow-hidden rounded-[6px] border border-[#DEDBD1]">
      <MapContainer
        center={value ? [value.lat, value.lng] : SRI_LANKA_CENTER}
        zoom={value ? SELECTED_ZOOM : DEFAULT_ZOOM}
        minZoom={6}
        maxZoom={18}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onChange={onChange} />
        {value && (
          <Marker
            position={[value.lat, value.lng]}
            icon={markerIcon}
            draggable
            eventHandlers={{
              dragend: (e) => {
                const pos = (e.target as L.Marker).getLatLng();
                onChange({ lat: round(pos.lat), lng: round(pos.lng) });
              },
            }}
          />
        )}
      </MapContainer>

      {!value && (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-[1000] flex justify-center">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] text-[#5B6472] shadow-sm">
            Click anywhere on the map to drop a pin
          </span>
        </div>
      )}
    </div>
  );
}
