import { useState } from "react";

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

function DetailPill({ children }) {
  if (!children) return null;

  return (
    <span className="truncate rounded-full border border-white/10 bg-white/[0.02] px-2.5 py-1 text-[11px] text-gray-300">
      {children}
    </span>
  );
}

function CardImage({ item }) {
  const [loaded, setLoaded] = useState(false);
  const src = item.thumbnailUrl || item.imageUrl;

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[11px] text-gray-500">
        No image
      </div>
    );
  }

  return (
    <>
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      >
        <div className="h-full w-full animate-pulse bg-white/[0.06]" />
      </div>

      <img
        src={src}
        alt={item.name || "Gem"}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[transform,opacity] duration-300 group-hover:scale-[1.04] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

function InventoryItemCard({ item, onClick }) {
  const caratText = formatCarat(item.carat);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="group flex w-full items-center gap-3 rounded-[22px] border border-white/10 bg-[#020617]/95 p-3 text-left shadow-[0_8px_24px_rgba(0,0,0,0.16)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-amber-400/50 hover:shadow-[0_14px_34px_rgba(0,0,0,0.24)]"
    >
      <div className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[18px] bg-black ring-1 ring-white/10">
        <CardImage item={item} />

        <div className="absolute left-1.5 top-1.5 flex max-w-[85%] flex-col gap-1">
          {item.isSold ? (
            <StatusBadge className="bg-red-500 text-white">SOLD</StatusBadge>
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
            </>
          )}
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-[15px] font-semibold leading-tight text-white sm:text-base">
              {item.name || "Untitled Gem"}
            </h3>

            <p className="mt-1 truncate text-sm text-gray-400">
              {item.stoneType || item.category || "Uncategorized"}
            </p>

            {item.stoneCode && (
              <p className="mt-1 text-[11px] tracking-[0.04em] text-gray-500">
                {item.stoneCode}
              </p>
            )}
          </div>

          {caratText && (
            <div className="shrink-0 rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-[11px] font-medium text-amber-300">
              {caratText}
            </div>
          )}
        </div>

        {(item.color || item.cut) && (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <DetailPill>{item.color}</DetailPill>
            <DetailPill>{item.cut}</DetailPill>
          </div>
        )}
      </div>
    </button>
  );
}

export default InventoryItemCard;