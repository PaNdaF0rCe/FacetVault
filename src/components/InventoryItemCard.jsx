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

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return null;

  const num = Number(value);
  if (Number.isNaN(num)) return null;

  return `LKR ${num.toLocaleString()}`;
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
    <span className="truncate rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/62">
      {children}
    </span>
  );
}

function CardImage({ item }) {
  const [loaded, setLoaded] = useState(false);
  const src = item.thumbnailUrl || item.imageUrl;

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[11px] text-white/30">
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
        <div className="h-full w-full animate-pulse bg-white/[0.05]" />
      </div>

      <img
        src={src}
        alt={item.name || "Gem"}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[transform,opacity] duration-300 group-hover:scale-[1.03] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
      />
    </>
  );
}

function InventoryItemCard({ item, onClick }) {
  const caratText = formatCarat(item.carat);
  const priceText = formatPrice(item.pricePaid);

  return (
    <button
      type="button"
      onClick={() => onClick(item)}
      className="group flex w-full flex-col overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))] text-left shadow-[0_14px_36px_rgba(0,0,0,0.16)] transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-amber-300/18 hover:shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-[#04101f]">
        <CardImage item={item} />

        <div className="absolute left-2 top-2 flex max-w-[78%] flex-wrap gap-1">
          {item.isSold ? (
            <StatusBadge className="bg-red-500 text-white">Sold</StatusBadge>
          ) : (
            <>
              {item.isForSale && (
                <StatusBadge className="bg-emerald-300 text-[#09101c]">
                  For Sale
                </StatusBadge>
              )}

              {item.isFeatured && (
                <StatusBadge className="bg-amber-300 text-[#09101c]">
                  Featured
                </StatusBadge>
              )}
            </>
          )}
        </div>

        {caratText && (
          <div className="absolute right-2 top-2 rounded-full border border-amber-300/18 bg-[rgba(9,16,28,0.82)] px-2 py-1 text-[10px] font-medium text-amber-300 backdrop-blur">
            {caratText}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <div className="min-h-[38px]">
          <h3
            className="line-clamp-2 text-[13px] font-semibold leading-[1.3] text-white"
            title={item.name || "Untitled Gem"}
          >
            {item.name || "Untitled Gem"}
          </h3>
        </div>

        <div className="mt-1 min-h-[16px]">
          <p
            className="truncate text-[11px] text-white/45"
            title={item.stoneType || item.category || "Uncategorized"}
          >
            {item.stoneType || item.category || "Uncategorized"}
          </p>
        </div>

        {item.stoneCode && (
          <p className="mt-1 text-[10px] tracking-[0.04em] text-white/32">
            {item.stoneCode}
          </p>
        )}

        {priceText && (
          <p className="mt-2 text-[13px] font-semibold text-amber-300">
            {priceText}
          </p>
        )}

        <div className="mt-2 flex min-h-[52px] flex-wrap gap-1.5">
          <DetailPill>{item.color}</DetailPill>
          <DetailPill>{item.cut}</DetailPill>
          <DetailPill>{item.origin}</DetailPill>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-white/34">
          <span>Qty {item.quantity || 1}</span>
          <span>{item.category || "Gem"}</span>
        </div>
      </div>
    </button>
  );
}

export default InventoryItemCard;