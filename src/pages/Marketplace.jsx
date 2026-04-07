import { useEffect, useMemo, useState } from "react";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import {
  CONTACT_PHONE,
  WHATSAPP_NUMBER,
} from "../config/appConfig";
import { Link } from "react-router-dom";

function formatMoney(value) {
  if (value === null || value === undefined || value === "") {
    return "Price on request";
  }

  const num = Number(value);
  if (Number.isNaN(num)) return "Price on request";

  return `LKR ${num.toLocaleString()}`;
}

function formatCarat(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return `${num} ct`;
}

function buildWhatsAppLink(item) {
  const name = item?.name || "this gemstone";
  const carat = item?.carat ? `${item.carat}ct` : "";
  const color = item?.color || "";
  const price = item?.salePrice
    ? ` (LKR ${Number(item.salePrice).toLocaleString()})`
    : "";

  const message = `Hi, I’d like to check availability for ${name}${
    carat ? ` (${carat})` : ""
  }${color ? ` - ${color}` : ""}${price}.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function DetailChip({ children }) {
  if (!children) return null;

  return (
    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-gray-300">
      {children}
    </span>
  );
}

function DetailRow({ label, value }) {
  if (!value && value !== 0) return null;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm text-white">{value}</p>
    </div>
  );
}

function ContactActions({ item, phoneRevealed, onRevealPhone }) {
  const hasWhatsApp = !!WHATSAPP_NUMBER;
  const hasPhone = !!CONTACT_PHONE;
  const whatsappLink = buildWhatsAppLink(item);

  return (
    <div className="space-y-3">
      {hasWhatsApp ? (
        <a
          href={whatsappLink}
          target="_blank"
          rel="noreferrer"
          className="block w-full rounded-2xl bg-amber-400 px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-amber-300"
        >
          Ask About This Stone
        </a>
      ) : (
        <button
          type="button"
          onClick={() => onRevealPhone(item.id)}
          className="block w-full rounded-2xl bg-amber-400 px-4 py-3 text-center text-sm font-semibold text-black transition hover:bg-amber-300"
        >
          Contact Me
        </button>
      )}

      {!phoneRevealed ? (
        <button
          type="button"
          onClick={() => onRevealPhone(item.id)}
          className="block w-full rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
        >
          Show Phone Number
        </button>
      ) : hasPhone ? (
        hasWhatsApp ? (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="block w-full rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/5"
          >
            {CONTACT_PHONE}
          </a>
        ) : (
          <div className="block w-full rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-semibold text-white">
            {CONTACT_PHONE}
          </div>
        )
      ) : (
        <div className="block w-full rounded-2xl border border-white/10 px-4 py-3 text-center text-sm text-gray-300">
          Contact number not configured yet
        </div>
      )}

      {phoneRevealed && hasWhatsApp && (
        <p className="text-center text-xs text-gray-500">
          Click the number to open WhatsApp
        </p>
      )}
    </div>
  );
}

function MarketplaceDetailModal({
  item,
  phoneRevealed,
  onRevealPhone,
  onClose,
}) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
        <div
          className="my-3 flex max-h-[calc(100vh-1.5rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#020617] text-gray-200 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#061224]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-400/80">
                  Available Stone
                </p>
                <h2 className="mt-1 text-xl font-semibold text-amber-300 sm:text-2xl">
                  {item.name || "Untitled Gem"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Full gemstone details and contact options
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <div className="space-y-5">
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#04101f]">
                  <div className="aspect-square w-full">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name || "Gemstone"}
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                        No image available
                      </div>
                    )}
                  </div>
                </div>

                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-white">
                    Quick Summary
                  </h3>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <DetailChip>{item.category}</DetailChip>
                    <DetailChip>{item.stoneType}</DetailChip>
                    <DetailChip>{item.color}</DetailChip>
                    <DetailChip>{item.cut}</DetailChip>
                    <DetailChip>{item.origin}</DetailChip>
                    <DetailChip>{formatCarat(item.carat)}</DetailChip>
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-white">Details</h3>

                  <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <DetailRow label="Stone Type" value={item.stoneType} />
                    <DetailRow label="Category" value={item.category} />
                    <DetailRow label="Carat" value={formatCarat(item.carat)} />
                    <DetailRow label="Color" value={item.color} />
                    <DetailRow label="Cut" value={item.cut} />
                    <DetailRow label="Origin" value={item.origin} />
                    <DetailRow
                      label="Quantity"
                      value={
                        item.quantity !== null &&
                        item.quantity !== undefined &&
                        item.quantity !== ""
                          ? String(item.quantity)
                          : null
                      }
                    />
                    <DetailRow
                      label="Selling Price"
                      value={formatMoney(item.salePrice)}
                    />
                  </div>
                </section>

                {item.notes ? (
                  <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-white">Notes</h3>
                    <div className="mt-3 rounded-xl border border-white/10 bg-[#020617] p-4 text-sm leading-6 text-gray-300">
                      {item.notes}
                    </div>
                  </section>
                ) : null}

                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-white">
                    Contact
                  </h3>
                  <p className="mt-2 text-sm text-gray-400">
                    Reach out directly for availability, payment, and delivery details.
                  </p>

                  <div className="mt-4">
                    <ContactActions
                      item={item}
                      phoneRevealed={phoneRevealed}
                      onRevealPhone={onRevealPhone}
                    />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketplaceCard({ item }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-[#020617]/95 transition hover:border-amber-400/40">
      <Link to={`/stone/${item.id}`} className="block w-full text-left">
        <div>
          <div className="aspect-square w-full overflow-hidden bg-[#04101f]">
            {item.imageUrl ? (
              <img
                src={item.thumbnailUrl || item.imageUrl}
                alt={item.name || "Gemstone"}
                className="h-full w-full object-cover"
                loading="lazy"
                decoding="async"
                sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
                No image
              </div>
            )}
          </div>

          <div className="space-y-2 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">

                <h2 className="truncate text-sm font-semibold text-white">
                  {item.name || "Untitled"}
                </h2>

                <p className="text-xs text-gray-400">
                  {item.stoneType || item.category || "Gem"}
                </p>
              </div>

              <span className="text-[9px] text-emerald-300">1 left</span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center text-[11px]">
              <div className="min-w-0">
                <p className="text-[9px] text-gray-500">Size</p>
                <p className="truncate text-white">
                  {item.carat ? `${item.carat}ct` : "—"}
                </p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] text-gray-500">Colour</p>
                <p className="truncate text-white">{item.color || "—"}</p>
              </div>

              <div className="min-w-0">
                <p className="text-[9px] text-gray-500">Price</p>
                <p className="truncate text-gray-400">View</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              <DetailChip>{item.category}</DetailChip>
              <DetailChip>{item.cut}</DetailChip>
              <DetailChip>{item.origin}</DetailChip>
            </div>
          </div>
        </div>
      </Link>

      <div className="px-3 pb-3">
        <Link
          to={`/stone/${item.id}`}
          className="relative mt-4 block w-full overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/10 to-amber-300/10 px-4 py-3 text-center text-sm font-semibold text-amber-300 transition-all duration-200 hover:from-amber-400 hover:to-amber-300 hover:text-black hover:shadow-lg hover:shadow-amber-400/10 active:scale-95"
        >
          <span className="relative z-10">View Stone</span>
          <span className="absolute inset-0 bg-amber-400/20 opacity-0 transition-opacity duration-200 active:opacity-100"></span>
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
        <div className="h-12 rounded bg-white/5" />
        <div className="h-9 rounded-xl bg-white/5" />
      </div>
    </div>
  );
}

function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadItems = async () => {
      try {
        const data = await getPublicSaleInventory();
        if (mounted) {
          setItems(Array.isArray(data) ? data : []);
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

    loadItems();

    return () => {
      mounted = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      return (
        (item.name || "").toLowerCase().includes(term) ||
        (item.stoneType || "").toLowerCase().includes(term) ||
        (item.category || "").toLowerCase().includes(term) ||
        (item.color || "").toLowerCase().includes(term) ||
        (item.cut || "").toLowerCase().includes(term) ||
        (item.origin || "").toLowerCase().includes(term)
      );
    });
  }, [items, search]);


  return (
    <div className="space-y-5 px-4 py-4 sm:space-y-6 sm:px-6 sm:py-6 lg:px-8">
      <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400/80 sm:text-xs">
          Curated Collection
        </p>

        <h1 className="mt-3 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-amber-300 sm:mt-2 sm:text-4xl">
          Curated Gemstones
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 sm:mt-2 sm:text-base sm:leading-6">
          Individually selected stones. Direct purchase. No middlemen.
        </p>

        <div className="mt-5 max-w-md">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, type, color, cut, or origin"
            className="w-full rounded-2xl border border-white/10 bg-[#020617] px-4 py-3 text-sm text-white placeholder-gray-500 outline-none transition focus:border-amber-400"
          />
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
          <h2 className="text-xl font-semibold text-white">
            No gemstones found
          </h2>
          <p className="mt-2 text-sm text-gray-400">
            There are no public sale items matching your search right now.
          </p>
        </section>
      ) : (
        <>
          <div className="flex items-center justify-between px-1">
            <p className="text-sm text-gray-400">
              {filteredItems.length} item
              {filteredItems.length === 1 ? "" : "s"} available
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <MarketplaceCard
                  key={item.id}
                  item={item}
              />
            ))}
          </div>
        </>
      )}

    </div>
  );
}

export default Marketplace;