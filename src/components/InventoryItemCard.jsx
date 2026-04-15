function formatCarat(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;

  return `${num
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")} ct`;
}

function StatusBadge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}
    >
      {children}
    </span>
  );
}

function InventoryItemCard({ item, onClick }) {
  const caratText = formatCarat(item.carat);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="group flex w-full items-center gap-4 rounded-2xl border border-white/8 bg-[#020617]/95 p-3.5 text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition duration-200 hover:-translate-y-0.5 hover:border-amber-400/70 hover:shadow-[0_14px_34px_rgba(0,0,0,0.24)] sm:p-4"
    >
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-black ring-1 ring-white/10 sm:h-24 sm:w-24">
        {item.thumbnailUrl || item.imageUrl ? (
          <img
            src={item.thumbnailUrl || item.imageUrl}
            alt={item.name || "Gem"}
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-500">
            No image
          </div>
        )}

        <div className="absolute left-1.5 top-1.5 flex max-w-[80%] flex-col gap-1">
          {item.isSold ? (
            <StatusBadge className="bg-red-500 text-white">
              SOLD
            </StatusBadge>
          ) : (
            <>
              {item.isForSale && (
                <StatusBadge className="bg-emerald-400 text-black">
                  For Sale
                </StatusBadge>
              )}

              {item.isFeatured && (
                <StatusBadge className="bg-amber-400 text-black">
                  Featured
                </StatusBadge>
              )}

              {item.isCollectorPiece && (
                <StatusBadge className="bg-purple-400 text-black">
                  Collector
                </StatusBadge>
              )}
            </>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white sm:text-lg">
              {item.name || "Untitled Gem"}
            </h3>

            <p className="mt-1 truncate text-sm text-gray-400">
              {item.stoneType || item.category || "Uncategorized"}
            </p>

            {item.stoneCode && (
              <p className="mt-1 text-[11px] text-gray-500">{item.stoneCode}</p>
            )}
          </div>

          {caratText && (
            <div className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
              {caratText}
            </div>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
          {item.color && (
            <span className="max-w-full truncate rounded-full border border-white/10 px-2.5 py-1">
              {item.color}
            </span>
          )}
          {item.cut && (
            <span className="max-w-full truncate rounded-full border border-white/10 px-2.5 py-1">
              {item.cut}
            </span>
          )}
          {item.origin && (
            <span className="max-w-full truncate rounded-full border border-white/10 px-2.5 py-1">
              {item.origin}
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center justify-end border-t border-white/5 pt-3 text-xs">
          <span className="text-gray-500 transition group-hover:text-amber-300">
            View →
          </span>
        </div>
      </div>
    </button>
  );
}

export default InventoryItemCard;