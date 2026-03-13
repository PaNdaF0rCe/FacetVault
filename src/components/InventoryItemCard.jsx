function InventoryItemCard({ item, onClick }) {
  return (
    <button
      onClick={() => onClick(item)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-[#020617]/95 p-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition hover:-translate-y-0.5 hover:border-amber-400/70 sm:p-4"
    >
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/10 sm:h-24 sm:w-24">
        <img
          src={item.imageUrl}
          alt={item.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white sm:text-lg">
              {item.name}
            </h3>
            <p className="mt-1 truncate text-sm text-gray-400">{item.stoneType}</p>
          </div>

          <div className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
            {item.carat ? `${item.carat} ct` : "—"}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          {item.color && (
            <span className="rounded-full border border-white/10 px-2.5 py-1">
              {item.color}
            </span>
          )}
          {item.cut && (
            <span className="rounded-full border border-white/10 px-2.5 py-1">
              {item.cut}
            </span>
          )}
          {item.origin && (
            <span className="rounded-full border border-white/10 px-2.5 py-1">
              {item.origin}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default InventoryItemCard;