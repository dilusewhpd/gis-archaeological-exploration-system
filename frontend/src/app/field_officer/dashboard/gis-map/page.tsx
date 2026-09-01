import GisMapView from "../../../analyst/dashboard/gis-map/GisMapView";

export default function FieldOfficerGisMapPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <div>
          <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">
            GIS Map
          </h1>
          <p className="mt-0.5 text-[12px] text-[#8A8478]">
            National spatial database and archaeological sites overview
          </p>
        </div>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <div className="rounded-[10px] border border-[#DEDBD1] bg-white p-5">
          <GisMapView isFieldOfficer={true} />
        </div>
      </main>
    </div>
  );
}
