import { useEffect, useMemo, useState } from "react";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import { Link } from "react-router-dom";
import {
  getExchangeRates,
  detectCurrency,
  convertFromLkr,
  formatCurrency,
} from "../lib/services/exchangeRates";

const PRICE_THRESHOLD = 5000;
const NEW_DAYS = 14;

function getJsDate(value) {
  if (!value) return null;

  if (value instanceof Date) return value;

  if (typeof value?.toDate === "function") {
    const date = value.toDate();
    return date instanceof Date && !Number.isNaN(date.getTime()) ? date : null;
  }

  if (typeof value?.seconds === "number") {
    const date = new Date(value.seconds * 1000);
    return !Number.isNaN(date.getTime()) ? date : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return !Number.isNaN(date.getTime()) ? date : null;
  }

  return null;
}

function isNewArrival(item) {
  const createdAt = getJsDate(item?.createdAt || item?.updatedAt);
  if (!createdAt) return false;

  const now = new Date();
  const diffMs = now.getTime() - createdAt.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= 0 && diffDays <= NEW_DAYS;
}

function isPreciousStone(stoneType = "") {
  const value = String(stoneType).toLowerCase().trim();

  return (
    value.includes("sapphire") ||
    value.includes("ruby") ||
    value.includes("emerald") ||
    value.includes("diamond")
  );
}

function getPrimaryBadge(item) {
  if (item?.isFeatured) {
    return {
      label: "Featured",
      className: "border-amber-400/30 bg-amber-400/15 text-amber-300",
    };
  }

  if (item?.isCollectorPiece) {
    return {
      label: "Collector",
      className: "border-fuchsia-400/30 bg-fuchsia-400/15 text-fuchsia-300",
    };
  }

  if (isNewArrival(item)) {
    return {
      label: "New",
      className: "border-sky-400/30 bg-sky-400/15 text-sky-300",
    };
  }

  const salePrice = Number(item?.salePrice);
  if (!Number.isNaN(salePrice) && salePrice <= PRICE_THRESHOLD) {
    return {
      label: "Under 5K",
      className: "border-emerald-400/30 bg-emerald-400/15 text-emerald-300",
    };
  }

  return null;
}

function FilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-amber-400 text-black shadow-[0_6px_20px_rgba(251,191,36,0.25)]"
          : "border border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function MarketplaceCard({ item, rates, currency }) {
  const salePrice = Number(item?.salePrice);

  let primaryPrice = "View price";
  let secondaryPrice = null;
  let isSmall = true;

  if (!Number.isNaN(salePrice) && salePrice <= PRICE_THRESHOLD) {
    if (currency === "LKR" || !rates?.rates) {
      primaryPrice = `LKR ${salePrice.toLocaleString()}`;
      isSmall = false;
    } else {
      const converted = convertFromLkr(salePrice, currency, rates.rates);

      if (converted) {
        primaryPrice = `Approx. ${formatCurrency(converted, currency)}`;
        secondaryPrice = `LKR ${salePrice.toLocaleString()}`;
        isSmall = false;
      } else {
        primaryPrice = `LKR ${salePrice.toLocaleString()}`;
        isSmall = false;
      }
    }
  }

  const badge = getPrimaryBadge(item);

  const detailText = [item.carat ? `${item.carat} ct` : null, item.color || null]
    .filter(Boolean)
    .join(" • ");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(4,14,30,0.96))] shadow-[0_12px_32px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:border-amber-400/25">
      <Link to={`/stone/${item.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-[#04101f]">
          {item.imageUrl ? (
            <img
              src={item.thumbnailUrl || item.imageUrl}
              alt={item.name || "Gemstone"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.015]"
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
              No image
            </div>
          )}

          <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1.5">
            {badge ? (
              <span
                className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-medium backdrop-blur ${badge.className}`}
              >
                {badge.label}
              </span>
            ) : null}
          </div>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-2.5 sm:p-3">
        <div className="min-h-[34px]">
          <h2
            className="line-clamp-2 text-[13px] font-semibold leading-[1.25] text-white"
            title={item.name || "Untitled"}
          >
            {item.name || "Untitled"}
          </h2>
        </div>

        <div className="mt-0.5 h-[16px]">
          <p
            className="truncate text-[11px] text-gray-400"
            title={item.stoneType || item.category || "Gem"}
          >
            {item.stoneType || item.category || "Gem"}
          </p>
        </div>

        <div className="mt-1.5 min-h-[18px]">
          <p
            className={`truncate leading-tight ${
              isSmall
                ? "text-[11px] font-medium text-gray-400"
                : "text-[13px] font-semibold text-amber-300"
            }`}
            title={primaryPrice}
          >
            {primaryPrice}
          </p>

          {secondaryPrice && (
            <p className="mt-0.5 text-[10px] text-gray-500">
              {secondaryPrice}
            </p>
          )}
        </div>

        <div className="mt-1 min-h-[28px]">
          <p
            className="line-clamp-2 text-[11px] leading-[1.35] text-gray-300"
            title={detailText || "—"}
          >
            {detailText || "—"}
          </p>
        </div>

        <Link
          to={`/stone/${item.id}`}
          className="mt-2.5 block w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-center text-[13px] font-medium text-white transition-all duration-200 hover:border-amber-400/25 hover:bg-amber-400/10 hover:text-amber-200 active:scale-[0.98]"
        >
          View Stone
        </Link>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-[#020617]/95">
      <div className="aspect-square bg-white/5" />
      <div className="space-y-3 p-3">
        <div className="h-4 w-2/3 rounded bg-white/5" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
        <div className="h-4 w-1/3 rounded bg-white/5" />
        <div className="h-8 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCollection, setActiveCollection] = useState("all");
  const [rates, setRates] = useState(null);
  const currency = detectCurrency();

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      try {
        const data = await getPublicSaleInventory();

        if (mounted) {
          const safeItems = Array.isArray(data)
            ? data.filter((item) => item?.isSold !== true)
            : [];

          setItems(safeItems);
        }
      } catch (error) {
        console.error("Failed to load public sale inventory:", error);
        if (mounted) {
          setItems([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    const loadRates = async () => {
      try {
        const data = await getExchangeRates();
        if (mounted) {
          setRates(data);
        }
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
      }
    };

    loadItems();
    loadRates();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    let result = [...items];

    switch (activeCollection) {
      case "precious":
        result = result.filter((item) => isPreciousStone(item.stoneType));
        break;
      case "semi":
        result = result.filter((item) => !isPreciousStone(item.stoneType));
        break;
      case "collector":
        result = result.filter((item) => item.isCollectorPiece === true);
        break;
      case "under5k":
        result = result.filter((item) => {
          const price = Number(item?.salePrice);
          return !Number.isNaN(price) && price <= PRICE_THRESHOLD;
        });
        break;
      case "featured":
        result = result.filter((item) => item.isFeatured === true);
        break;
      case "new":
        result = result.filter((item) => isNewArrival(item));
        break;
      case "all":
      default:
        break;
    }

    const term = search.trim().toLowerCase();

    if (term) {
      result = result.filter((item) => {
        return (
          (item.name || "").toLowerCase().includes(term) ||
          (item.stoneType || "").toLowerCase().includes(term) ||
          (item.category || "").toLowerCase().includes(term) ||
          (item.color || "").toLowerCase().includes(term) ||
          (item.cut || "").toLowerCase().includes(term) ||
          (item.origin || "").toLowerCase().includes(term) ||
          (item.stoneCode || "").toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [items, search, activeCollection]);

  const emptyStateTitle = useMemo(() => {
    switch (activeCollection) {
      case "featured":
        return "No featured stones found";
      case "collector":
        return "No collector pieces found";
      case "under5k":
        return "No stones under LKR 5,000 found";
      case "new":
        return "No new arrivals found";
      case "precious":
        return "No precious stones found";
      case "semi":
        return "No semi-precious stones found";
      default:
        return "No gemstones found";
    }
  }, [activeCollection]);

  const emptyStateText = search.trim()
    ? "Try a different search term or collection."
    : "There are no public sale items in this collection right now.";

  return (
    <div className="space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400/80 sm:text-xs">
          Curated Collection
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-amber-300 sm:mt-2 sm:text-4xl">
          Curated Gemstones
        </h1>

        <div className="mt-5 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search gemstones..."
              className="w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-amber-400"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { key: "all", label: "All" },
              { key: "featured", label: "Featured" },
              { key: "new", label: "New" },
              { key: "under5k", label: "Under 5K" },
              { key: "precious", label: "Precious" },
              { key: "semi", label: "Semi-Precious" },
              { key: "collector", label: "Collector" },
            ].map((f) => (
              <FilterChip
                key={f.key}
                label={f.label}
                active={activeCollection === f.key}
                onClick={() => setActiveCollection(f.key)}
              />
            ))}
          </div>
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <LoadingCard key={index} />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <section className="rounded-[28px] border border-white/10 bg-[#020617]/90 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
          <h2 className="text-xl font-semibold text-white">{emptyStateTitle}</h2>
          <p className="mt-2 text-sm text-gray-400">{emptyStateText}</p>
        </section>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-gray-400">
              {filteredItems.length} item
              {filteredItems.length === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="grid grid-cols-2 items-stretch gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <MarketplaceCard
                key={item.id}
                item={item}
                rates={rates}
                currency={currency}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default Marketplace;