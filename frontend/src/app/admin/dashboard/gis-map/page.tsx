import GisMapView from "../../../analyst/dashboard/gis-map/GisMapView";

/**
 * GIS map — /admin/dashboard/gis-map
 */
export default function AdminGisMapPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-6 py-4 lg:px-9">
        <div>
          <h1 className="font-serif text-[22px] tracking-tight text-[#3A2A12]">
            GIS Map
          </h1>
          <p className="mt-0.5 text-[13px] text-[#8A8478]">
            National spatial database and site layer monitoring
          </p>
        </div>
      </header>

      <main className="flex-1 px-6 py-7 lg:px-9 bg-[#F0E6C8]/30">
        <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-5">
          <GisMapView />
        </div>
      </main>
    </div>
  );
}
