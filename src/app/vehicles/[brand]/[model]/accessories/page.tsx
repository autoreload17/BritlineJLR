export default function AccessoriesPage() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[var(--border-color)] overflow-hidden">
          <div className="h-40 bg-silver/20" />
          <div className="p-4">
            <div className="text-sm font-medium">Accessory {i + 1}</div>
            <div className="mt-2 text-sm text-zinc-500">£120</div>
            <div className="mt-3 flex items-center justify-between text-sm">
              <button className="px-3 py-1 rounded-full border border-[var(--border-color)]">Details</button>
              <button className="px-3 py-1 rounded-full bg-[var(--accent-gold)] text-white">Add</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}















