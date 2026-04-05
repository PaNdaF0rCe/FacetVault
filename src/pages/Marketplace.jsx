import { useEffect, useMemo, useState } from "react";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import {
  CONTACT_PHONE,
  WHATSAPP_MESSAGE,
  WHATSAPP_NUMBER,
} from "../config/appConfig";

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
  const baseMessage =
    WHATSAPP_MESSAGE || "Hello, I'm interested in this gemstone.";
  const gemName = item?.name ? ` Gem: ${item.name}.` : "";
  const message = `${baseMessage}${gemName}`.trim();

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function SaleBadge() {
  return (
    <span className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-emerald-300">
      Available
    </span>
  );
}

function DetailChip({ children }) {
  if (!children) return null;

  return (
    <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-gray-300">
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

function ContactButton({ item, phoneRevealed, onRevealPhone, fullWidth = true }) {
  const hasWhatsApp = !!WHATSAPP_NUMBER;
  const hasPhone = !!CONTACT_PHONE;
  const whatsappLink = buildWhatsAppLink(item);

  const baseClass = fullWidth
    ? "block w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold transition"
    : "inline-flex rounded-2xl px-4 py-3 text-center text-sm font-semibold transition";

  if (!phoneRevealed) {
    return (
      <button
        type="button"
        onClick={() => onRevealPhone(item.id)}
        className={`${baseClass} bg-amber-400 text-black hover:bg-amber-300`}
      >
        Contact Me
      </button>
    );
  }

  if (!hasPhone) {
    return (
      <div
        className={`${baseClass} border border-white/10 text-gray-300`}
      >
        Contact number not configured yet
      </div>
    );
  }

  if (hasWhatsApp) {
    return (
      <a
        href={whatsappLink}
        target="_blank"
        rel="noreferrer"
        className={`${baseClass} border border-white/10 text-white hover:border-white/20 hover:bg-white/5`}
      >
        {CONTACT_PHONE}
      </a>
    );
  }

  return (
    <div className={`${baseClass} border border-white/10 text-white`}>
      {CONTACT_PHONE}
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
                  Public Collection
                </p>
                <h2 className="mt-1 text-xl font-semibold text-amber-300 sm:text-2xl">
                  {item.name || "Untitled Gem"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Full gemstone details
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
                    Quick summary
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

                  <div className="mt-4">
                    <ContactButton
                      item={item}
                      phoneRevealed={phoneRevealed}
                      onRevealPhone={onRevealPhone}
                    />
                  </div>

                  {phoneRevealed && !!WHATSAPP_NUMBER && (
                    <p className="mt-3 text-center text-xs text-gray-500">
                      Click the number to open WhatsApp
                    </p>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MarketplaceCard({ item, phoneRevealed, onRevealPhone, onOpen }) {
  return (
    <article className="overflow-hidden rounded-3xl border border-white/10 bg-[#020617]/95 shadow-[0_14px_34px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-amber-400/40">
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="w-full text-left"
      >
        <div className="aspect-square w-full overflow-hidden bg-[#04101f]">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name || "Gemstone"}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
              No image available
            </div>
          )}
        </div>

        <div className="space-y-4 p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold text-white">
                {item.name || "Untitled Gem"}
              </h2>
              <p className="mt-1 text-sm text-gray-400">
                {item.stoneType || item.category || "Gemstone"}
              </p>
            </div>

            <SaleBadge />
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-[#04101f]/70 p-3 text-center">
            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Size
              </p>
              <p className="mt-1 text-sm font-semibold text-white">
                {formatCarat(item.carat) || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Colour
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-white">
                {item.color || "—"}
              </p>
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Price
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-amber-300">
                {formatMoney(item.salePrice)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <DetailChip>{item.category}</DetailChip>
            <DetailChip>{item.cut}</DetailChip>
            <DetailChip>{item.origin}</DetailChip>
          </div>
        </div>
      </button>

      <div className="px-5 pb-5">
        <ContactButton
          item={item}
          phoneRevealed={phoneRevealed}
          onRevealPhone={onRevealPhone}
        />

        {phoneRevealed && !!WHATSAPP_NUMBER && (
          <p className="mt-3 text-center text-xs text-gray-500">
            Click the number to open WhatsApp
          </p>
        )}
      </div>
    </article>
  );
}

function Marketplace() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedPhones, setRevealedPhones] = useState({});
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

  const handleRevealPhone = (itemId) => {
    setRevealedPhones((prev) => ({
      ...prev,
      [itemId]: true,
    }));
  };

  return (
    <div className="space-y-5 sm:space-y-6">
      <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400/80 sm:text-xs">
          Public Collection
        </p>

        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-amber-300 sm:text-4xl">
          Gemstones Available for Sale
        </h1>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:text-base">
          Browse the stones currently listed for sale. Only publicly available
          items appear here.
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="animate-pulse overflow-hidden rounded-3xl border border-white/10 bg-[#020617]/95"
            >
              <div className="aspect-square bg-white/5" />
              <div className="space-y-3 p-5">
                <div className="h-6 w-1/2 rounded bg-white/5" />
                <div className="h-4 w-1/3 rounded bg-white/5" />
                <div className="h-20 rounded bg-white/5" />
                <div className="h-12 rounded-2xl bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <section className="rounded-3xl border border-white/10 bg-[#020617]/90 p-8 text-center shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
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

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredItems.map((item) => (
              <MarketplaceCard
                key={item.id}
                item={item}
                phoneRevealed={!!revealedPhones[item.id]}
                onRevealPhone={handleRevealPhone}
                onOpen={setSelectedItem}
              />
            ))}
          </div>
        </>
      )}

      {selectedItem && (
        <MarketplaceDetailModal
          item={selectedItem}
          phoneRevealed={!!revealedPhones[selectedItem.id]}
          onRevealPhone={handleRevealPhone}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default Marketplace;