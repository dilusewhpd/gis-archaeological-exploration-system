import GisMapView from "./GisMapView";

export default function GisMapPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-[#DEDBD1] bg-[#FAF6EB] px-8 py-4">
        <h1 className="font-serif text-[20px] tracking-tight text-[#3A2A12]">GIS map</h1>
      </header>

      <main className="flex-1 px-8 py-7 bg-[#F0E6C8]/30">
        <GisMapView />
      </main>
    </div>
  );
}