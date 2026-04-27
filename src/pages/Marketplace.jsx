import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Search } from "lucide-react";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import {
  getExchangeRates,
  detectCurrency,
  convertFromLkr,
  formatCurrency,
} from "../lib/services/exchangeRates";

const PRICE_THRESHOLD = 15000;
const NEW_DAYS = 7;

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
      className: "border-amber-300/18 bg-amber-300/10 text-amber-200",
    };
  }

  if (item?.isCollectorPiece) {
    return {
      label: "Collector",
      className: "border-fuchsia-300/16 bg-fuchsia-300/8 text-fuchsia-200",
    };
  }

  if (isNewArrival(item)) {
    return {
      label: "New",
      className: "border-sky-300/16 bg-sky-300/8 text-sky-200",
    };
  }

  const isSold = item?.isSold === true;
  const salePrice = Number(item?.salePrice ?? item?.pricePaid);
  if (!Number.isNaN(salePrice) && salePrice > 0 && salePrice <= PRICE_THRESHOLD) {
    return {
      label: "Value",
      className: "border-emerald-300/16 bg-emerald-300/8 text-emerald-200",
    };
  }

  return null;
}

function MarketplaceImage({ item }) {
  const [loaded, setLoaded] = useState(false);
  const imageSrc = item.thumbnailUrl || item.imageUrl;

  if (!imageSrc) {
    return (
      <div className="flex h-full w-full items-center justify-center text-[11px] text-white/28">
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
        src={imageSrc}
        alt={item.name || "Gemstone"}
        className={`h-full w-full object-cover transition-[transform,opacity] duration-500 group-hover:scale-[1.018] ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        loading="lazy"
        decoding="async"
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, (max-width: 1536px) 25vw, 20vw"
        onLoad={() => setLoaded(true)}
      />
    </>
  );
}

function MarketplaceCard({ item, rates, currency }) {
  const isSold = item?.isSold === true;
  const salePrice = Number(item?.salePrice ?? item?.pricePaid);

  let primaryPrice = "View price";
  let secondaryPrice = null;
  let isSmall = true;

  if (isSold) {
    primaryPrice = "Recently sold";
    secondaryPrice = null;
    isSmall = false;
  } else if (!Number.isNaN(salePrice)) {
    if (salePrice === 0 || salePrice > 15000) {
      primaryPrice = "View price";
      secondaryPrice = null;
      isSmall = true;
    } else if (salePrice > 0) {
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
  }

  const badge = getPrimaryBadge(item);

  const detailText = [item.carat ? `${item.carat} ct` : null, item.color || null]
    .filter(Boolean)
    .join(" • ");

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))] shadow-[0_14px_36px_rgba(0,0,0,0.16)] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-amber-300/18 hover:shadow-[0_18px_42px_rgba(0,0,0,0.22)]">
      <Link to={`/stone/${item.id}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-[#04101f]">
          <MarketplaceImage item={item} />

          <div className="absolute right-2.5 top-2.5 flex flex-col items-end gap-1.5">
            {item?.isSold ? (
              <span className="inline-flex rounded-full border border-rose-300/20 bg-rose-300/12 px-2 py-0.5 text-[10px] font-medium text-rose-200 backdrop-blur">
                Sold
              </span>
            ) : null}

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

      <div className="flex flex-1 flex-col p-3 lg:p-3.5">
        <div className="min-h-[36px]">
          <h2
            className="line-clamp-2 text-[13px] font-semibold leading-[1.3] text-white"
            title={item.name || "Untitled"}
          >
            {item.name || "Untitled"}
          </h2>
        </div>

        <div className="mt-1 h-[16px]">
          <p
            className="truncate text-[11px] text-white/42"
            title={item.stoneType || item.category || "Gem"}
          >
            {item.stoneType || item.category || "Gem"}
          </p>
        </div>

        <div className="mt-2 min-h-[18px]">
          <p
            className={`truncate leading-tight ${
              isSmall
                ? "text-[11px] font-medium text-white/38"
                : "text-[13px] font-semibold text-amber-300"
            }`}
            title={primaryPrice}
          >
            {primaryPrice}
          </p>

          {secondaryPrice ? (
            <p className="mt-0.5 text-[10px] text-white/30">{secondaryPrice}</p>
          ) : null}
        </div>

        <div className="mt-1.5 min-h-[30px]">
          <p
            className="line-clamp-2 text-[11px] leading-[1.4] text-white/52"
            title={detailText || "—"}
          >
            {detailText || "—"}
          </p>
        </div>

        <Link
          to={`/stone/${item.id}`}
          className={`mt-3 block w-full rounded-xl px-3 py-2.5 text-center text-[13px] font-medium transition-[transform,border-color,background-color,color] duration-200 active:scale-[0.98] ${
            item?.isSold
              ? "border border-rose-300/12 bg-rose-300/8 text-rose-200 hover:border-rose-300/20 hover:bg-rose-300/12"
              : "border border-white/8 bg-white/[0.025] text-white hover:border-amber-300/18 hover:bg-amber-300/8 hover:text-amber-200"
          }`}
        >
          {item?.isSold ? "View Sold Stone" : "View Stone"}
        </Link>
      </div>
    </article>
  );
}

function LoadingCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))]">
      <div className="aspect-square bg-white/[0.05]" />
      <div className="space-y-3 p-3">
        <div className="h-4 w-2/3 rounded bg-white/[0.05]" />
        <div className="h-3 w-1/2 rounded bg-white/[0.05]" />
        <div className="h-4 w-1/3 rounded bg-white/[0.05]" />
        <div className="h-10 rounded-xl bg-white/[0.05]" />
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
          const safeItems = Array.isArray(data) ? data : [];
          setItems(safeItems);
        }
      } catch (error) {
        console.error("Failed to load public sale inventory:", error);
        if (mounted) setItems([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const loadRates = async () => {
      try {
        const data = await getExchangeRates();
        if (mounted) setRates(data);
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
      case "premium":
        result = result.filter((item) => {
          const price = Number(item?.salePrice ?? item?.pricePaid);
          return !Number.isNaN(price) && (price === 0 || price > PRICE_THRESHOLD);
        });
        break;
      case "under5k":
        result = result.filter((item) => {
          const price = Number(item?.salePrice ?? item?.pricePaid);
          return !Number.isNaN(price) && price > 0 && price <= PRICE_THRESHOLD;
        });
        break;
      case "featured":
        result = result.filter((item) => item.isFeatured === true);
        break;
      case "new":
        result = result.filter((item) => isNewArrival(item));
        break;
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
      case "premium":
        return "No premium stones found";
      case "under5k":
        return "No value stones found";
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

  const filters = [
    { key: "all", label: "All" },
    { key: "featured", label: "Featured" },
    { key: "new", label: "New" },
    { key: "premium", label: "Premium" },
    { key: "under5k", label: "Value" },
    { key: "precious", label: "Precious" },
    { key: "semi", label: "Semi-Precious" },
    { key: "collector", label: "Collector" },
  ];

  return (
    <>
      <Helmet>
        <title>Collection | FacetVault</title>
        <meta
          name="description"
          content="Browse the public gemstone collection on FacetVault."
        />
      </Helmet>

      <div className="mx-auto w-full max-w-[1600px] space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8 2xl:px-10">
        <section className="relative pb-3 sm:pb-4">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_18%_0%,rgba(251,191,36,0.035),transparent_55%)]" />

          <div className="relative z-10">
            <p className="text-[10px] font-medium uppercase tracking-[0.34em] text-amber-300/65">
              Curated Collection
            </p>

            <div className="mt-4">
              <div className="relative max-w-xl">
                <div className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-white/28">
                  <Search size={14} strokeWidth={1.4} />
                </div>

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search gemstones..."
                  className="w-full border-0 border-b border-white/8 bg-transparent py-2.5 pl-6 pr-2 text-sm text-white placeholder:text-white/24 outline-none transition-[border-color,color] duration-200 focus:border-amber-300/30"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-5">
              {filters.map((f) => {
                const active = activeCollection === f.key;

                return (
                  <button
                    key={f.key}
                    onClick={() => setActiveCollection(f.key)}
                    className={`group relative pb-1 text-[11px] uppercase tracking-[0.2em] transition-colors duration-200 ${
                      active
                        ? "text-amber-300"
                        : "text-white/38 hover:text-white/72"
                    }`}
                  >
                    {f.label}
                    <span
                      className={`absolute bottom-0 left-0 h-[2px] rounded-full transition-all duration-200 ${
                        active
                          ? "w-full bg-amber-300 opacity-100"
                          : "w-0 bg-white/30 opacity-0 group-hover:w-full group-hover:opacity-100"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {loading ? (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingCard key={index} />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <section className="rounded-[28px] border border-white/8 bg-white/[0.03] p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
            <h2 className="text-xl font-semibold text-white">{emptyStateTitle}</h2>
            <p className="mt-2 text-sm text-white/45">{emptyStateText}</p>
          </section>
        ) : (
          <>
            <div className="mt-1 flex items-center justify-between px-0.5">
              <p className="text-[13px] text-white/42">
                {filteredItems.length} item{filteredItems.length === 1 ? "" : "s"} shown
              </p>
            </div>

            <div className="grid grid-cols-2 items-stretch gap-3.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
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
    </>
  );
}

export default Marketplace;