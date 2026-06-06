import { useState } from "react";
import { Link } from "react-router-dom";

function formatCarat(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return `${num.toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1")} ct`;
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return `LKR ${num.toLocaleString()}`;
}

function formatSalePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num) || num <= 0) return null;
  return `LKR ${num.toLocaleString()}`;
}

function StatusBadge({ children, className = "" }) {
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${className}`}>
      {children}
    </span>
  );
}

function DetailPill({ children }) {
  if (!children) return null;
  return (
    <span className="truncate rounded-full border border-white/8 bg-white/[0.025] px-2.5 py-1 text-[10px] text-white/55">
      {children}
    </span>
  );
}

function CardImage({ item }) {
  const [loaded, setLoaded] = useState(false);
  const src = item.thumbnailUrl || item.mediumUrl || item.imageUrl;

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[11px] text-white/30">
        No image
      </div>
    );
  }

  const candidates = [
    item.thumbnailUrl ? `${item.thumbnailUrl} 600w` : null,
    item.mediumUrl    ? `${item.mediumUrl} 1000w`    : null,
    item.imageUrl     ? `${item.imageUrl} 1600w`     : null,
  ].filter(Boolean);
  const srcSet = candidates.length > 1 ? candidates.join(", ") : undefined;

  return (
    <>
      <div className={`absolute inset-0 transition-opacity duration-500 ${loaded ? "opacity-0" : "opacity-100"}`}>
        <div className="h-full w-full animate-pulse bg-white/[0.05]" />
      </div>
      <img
        src={src}
        srcSet={srcSet}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        alt={item.name || "Natural gemstone"}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-[transform,opacity] duration-300 group-hover:scale-[1.018] ${loaded ? "opacity-100" : "opacity-0"}`}
      />
    </>
  );
}

function CardBody({ item }) {
  const caratText    = formatCarat(item.carat);
  const priceText    = formatPrice(item.pricePaid);
  const salePriceText = formatSalePrice(item.salePrice);

  return (
    <>
      {/* image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#030d1a]">
        <CardImage item={item} />

        {/* bottom fade — blends studio photo backgrounds into the dark card */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[rgba(4,11,22,0.72)] to-transparent" />

        {/* status badges — top left */}
        <div className="absolute left-2.5 top-2.5 flex max-w-[78%] flex-wrap gap-1">
          {item.isSold ? (
            <StatusBadge className="bg-red-500 text-white">Sold</StatusBadge>
          ) : (
            <>
              {item.isForSale  && <StatusBadge className="bg-emerald-300 text-[#09101c]">For Sale</StatusBadge>}
              {item.isFeatured && <StatusBadge className="bg-amber-300 text-[#09101c]">Featured</StatusBadge>}
            </>
          )}
        </div>

        {/* carat — top right */}
        {caratText && (
          <div className="absolute right-2.5 top-2.5 rounded-full border border-amber-300/18 bg-[rgba(9,16,28,0.82)] px-2 py-1 text-[10px] font-medium text-amber-300 backdrop-blur">
            {caratText}
          </div>
        )}
      </div>

      {/* text body */}
      <div className="flex flex-1 flex-col p-4">
        {/* name */}
        <h3
          className="line-clamp-2 text-[15px] font-semibold leading-[1.3] text-white"
          title={item.name || "Untitled Gem"}
        >
          {item.name || "Untitled Gem"}
        </h3>

        {/* type */}
        <p className="mt-1 truncate text-[12px] text-white/55">
          {item.stoneType || item.category || "Uncategorized"}
        </p>

        {/* stone code */}
        {item.stoneCode && (
          <p className="mt-0.5 truncate text-[10.5px] tracking-[0.04em] text-white/32">
            {item.stoneCode}
          </p>
        )}

        {/* treatment disclosure */}
        {item.treatment && (
          <p className="mt-2 border-l-2 border-amber-400/50 pl-2 text-[11px] text-amber-300/80">
            {item.treatment}
          </p>
        )}

        {/* price */}
        <div className="mt-3">
          {priceText ? (
            <>
              <p className="truncate font-display text-[15px] font-semibold tracking-tight text-amber-300/90">
                {salePriceText || priceText}
              </p>
              {salePriceText && (
                <p className="truncate text-[11px] text-white/32 line-through">{priceText}</p>
              )}
            </>
          ) : (
            <p className="text-[12px] font-medium text-white/38">Ask for price</p>
          )}
        </div>

        {/* detail pills / text */}
        <div className="mt-2 hidden min-h-[28px] lg:block">
          <p className="line-clamp-2 text-[12px] leading-[1.45] text-white/50">
            {[item.color, item.cut, item.origin].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap gap-1.5 lg:hidden">
          <DetailPill>{item.color}</DetailPill>
          <DetailPill>{item.cut}</DetailPill>
          <DetailPill>{item.origin}</DetailPill>
        </div>

        {/* footer meta */}
        <div className="mt-3 flex items-center justify-between text-[10.5px] text-white/36">
          <span>Qty {item.quantity || 1}</span>
          <span>{item.category || "Gem"}</span>
        </div>
      </div>
    </>
  );
}

/**
 * InventoryItemCard
 *
 * Two modes:
 *  - With onClick prop  → renders as <button> (admin inventory views)
 *  - Without onClick    → renders as <Link to="/stone/:id"> (public pages)
 */
function InventoryItemCard({ item, onClick }) {
  const cardClass = "lux-card-elevated group flex w-full flex-col overflow-hidden text-left";

  if (onClick) {
    return (
      <button type="button" onClick={() => onClick(item)} className={cardClass}>
        <CardBody item={item} />
      </button>
    );
  }

  return (
    <Link to={`/stone/${item.id}`} className={cardClass}>
      <CardBody item={item} />
    </Link>
  );
}

export default InventoryItemCard;
