import GisMapView from "../../../analyst/dashboard/gis-map/GisMapView";

/**
 * GIS map — /senior_officer/dashboard/gis-map
 * Reuses the shared GisMapView; a senior officer sees all sites.
 */
export default function SeniorOfficerGisMapPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">GIS map</h1>
        <p className="mt-0.5 text-[12px] text-[#8A8478]">
          National spatial database and archaeological sites overview
        </p>
      </header>

      <main className="flex-1 bg-[#F0E6C8]/30 px-8 py-7">
        <GisMapView role="senior_officer" />
      </main>
    </div>
  );
}
