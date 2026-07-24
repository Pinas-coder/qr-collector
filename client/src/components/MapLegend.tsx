const categories = [
  { name: "Storia", color: "#006b5c" },
  { name: "Natura", color: "#00C853" },
  { name: "Cultura", color: "#fd6c00" },
  { name: "Bonus", color: "#9f4200" }
];

export default function MapLegend() {
  return (
    <div className="absolute bottom-20 left-4 z-[500] max-w-xs rounded-xl border border-outline-variant bg-surface-card p-3 shadow-lg">
      <h3 className="mb-2 font-display text-xs font-semibold uppercase text-on-surface">Legenda</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category.name} className="flex items-center gap-2">
            <span className="h-5 w-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: category.color }} />
            <span className="text-xs text-on-surface">{category.name}</span>
          </div>
        ))}
        <div className="mt-2 flex items-center gap-2 border-t border-outline-variant pt-2">
          <span className="h-5 w-5 rounded-full border-2 border-white bg-outline-variant opacity-60 shadow-sm" />
          <span className="text-xs text-on-surface-variant">Non sbloccato</span>
        </div>
      </div>
    </div>
  );
}
