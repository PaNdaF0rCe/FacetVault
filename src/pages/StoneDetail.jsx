import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import {
  CONTACT_PHONE,
  WHATSAPP_NUMBER,
} from "../config/appConfig";

function buildWhatsAppLink(item) {
  const name = item?.name || "this gemstone";
  const carat = item?.carat ? `${item.carat}ct` : "";
  const color = item?.color || "";
  const price =
    item?.salePrice !== null &&
    item?.salePrice !== undefined &&
    item?.salePrice !== ""
      ? ` (LKR ${Number(item.salePrice).toLocaleString()})`
      : "";

  const message = `Hi, I’d like to check availability for ${name}${
    carat ? ` (${carat})` : ""
  }${color ? ` - ${color}` : ""}${price}.`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

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

function buildMetaDescription(item) {
  const parts = [
    item?.name,
    formatCarat(item?.carat),
    item?.color,
    item?.stoneType || item?.category,
    item?.origin ? `from ${item.origin}` : null,
  ].filter(Boolean);

  const base = parts.join(" · ");
  return base
    ? `${base}. View details and inquire directly through FacetVault.`
    : "View gemstone details and inquire directly through FacetVault.";
}

function DetailBlock({ label, value }) {
  if (!value && value !== 0) return null;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-gray-500">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-white">{value}</p>
    </div>
  );
}

function StoneDetail() {
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadItem = async () => {
      try {
        const data = await getPublicSaleInventory();
        const found = Array.isArray(data)
          ? data.find((entry) => String(entry.id) === String(id))
          : null;

        if (mounted) {
          setItem(found || null);
        }
      } catch (error) {
        console.error("Error loading stone:", error);
        if (mounted) {
          setItem(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadItem();

    return () => {
      mounted = false;
    };
  }, [id]);

  const pageTitle = useMemo(() => {
    if (loading) return "Loading Stone | FacetVault";
    if (!item) return "Stone Not Found | FacetVault";

    const parts = [
      item.name || "Gemstone",
      formatCarat(item.carat),
      item.color,
    ].filter(Boolean);

    return `${parts.join(" | ")} | FacetVault`;
  }, [item, loading]);

  const metaDescription = useMemo(() => {
    if (loading) {
      return "Loading gemstone details from FacetVault.";
    }
    if (!item) {
      return "This gemstone is no longer available or could not be found on FacetVault.";
    }
    return buildMetaDescription(item);
  }, [item, loading]);

  const canonicalUrl = `https://facetvault.store/stone/${id}`;
  const ogImage =
    item?.imageUrl || "https://facetvault.store/StockSmart-AI.png";

  if (loading) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={metaDescription} />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={ogImage} />
        </Helmet>

        <div className="mx-auto max-w-6xl px-4 py-6 text-white sm:px-6 lg:px-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 w-2/3 rounded bg-white/10" />
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="aspect-square rounded-3xl bg-white/5" />
              <div className="space-y-4">
                <div className="h-24 rounded-3xl bg-white/5" />
                <div className="grid grid-cols-2 gap-3">
                  <div className="h-20 rounded-2xl bg-white/5" />
                  <div className="h-20 rounded-2xl bg-white/5" />
                  <div className="h-20 rounded-2xl bg-white/5" />
                  <div className="h-20 rounded-2xl bg-white/5" />
                </div>
                <div className="h-28 rounded-3xl bg-white/5" />
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!item) {
    return (
      <>
        <Helmet>
          <title>{pageTitle}</title>
          <meta name="description" content={metaDescription} />
          <meta name="robots" content="noindex, follow" />
          <link rel="canonical" href={canonicalUrl} />
          <meta property="og:title" content={pageTitle} />
          <meta property="og:description" content={metaDescription} />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:type" content="website" />
          <meta property="og:image" content={ogImage} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={pageTitle} />
          <meta name="twitter:description" content={metaDescription} />
          <meta name="twitter:image" content={ogImage} />
        </Helmet>

        <div className="mx-auto max-w-3xl px-4 py-10 text-white sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-white/10 bg-[#020617]/90 p-8 text-center">
            <h1 className="text-2xl font-semibold text-white">Stone not found</h1>
            <p className="mt-3 text-sm leading-6 text-gray-400">
              This gemstone may have been removed or is no longer available.
            </p>
          </div>
        </div>
      </>
    );
  }

  const summaryChips = [
    item.category,
    item.stoneType,
    item.color,
    item.cut,
    item.origin,
    formatCarat(item.carat),
  ].filter(Boolean);

  return (
    <>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:type" content="product" />
        <meta property="og:image" content={ogImage} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div className="mx-auto max-w-6xl px-4 py-5 text-white sm:px-6 lg:px-8">
        <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.82),rgba(4,14,30,0.76))] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.24)] sm:p-6">
          <p className="text-[11px] uppercase tracking-[0.28em] text-amber-400/80">
            Available Stone
          </p>

          <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-amber-300 sm:text-4xl">
                {item.name || "Untitled Gem"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base sm:leading-7">
                Individually documented gemstone available for direct inquiry and purchase.
              </p>
            </div>

            <div className="shrink-0">
              <span className="inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-300">
                Only {item.quantity && Number(item.quantity) > 0 ? item.quantity : 1} available
              </span>
            </div>
          </div>
        </section>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="space-y-5">
            <div className="overflow-hidden rounded-[28px] border border-white/10 bg-[#04101f] shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
              <div className="aspect-square w-full">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name || "Gemstone"}
                    className="h-full w-full object-cover"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    sizes="(max-width: 1024px) 100vw, 55vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                    No image available
                  </div>
                )}
              </div>
            </div>

            <section className="rounded-[28px] border border-white/10 bg-[#020617]/90 p-5">
              <h2 className="text-sm font-semibold text-white">Quick Summary</h2>

              <div className="mt-4 flex flex-wrap gap-2">
                {summaryChips.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-gray-300"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </section>
          </section>

          <section className="space-y-5">
            <div className="rounded-[28px] border border-amber-400/15 bg-[#020617]/95 p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
              <p className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
                Price
              </p>
              <p className="mt-2 text-3xl font-semibold text-white">
                {formatMoney(item.salePrice)}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Message directly to confirm availability, payment, and delivery details.
              </p>

              <div className="mt-5 space-y-3">
                {WHATSAPP_NUMBER ? (
                  <a
                    href={buildWhatsAppLink(item)}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full rounded-2xl bg-amber-400 px-4 py-3.5 text-center text-sm font-semibold text-black transition hover:bg-amber-300"
                  >
                    Enquire on WhatsApp
                  </a>
                ) : (
                  <div className="block w-full rounded-2xl border border-white/10 px-4 py-3.5 text-center text-sm text-gray-400">
                    WhatsApp number not configured yet
                  </div>
                )}

                {CONTACT_PHONE ? (
                  <div className="rounded-2xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-white">
                    {CONTACT_PHONE}
                  </div>
                ) : null}
              </div>
            </div>

            <section className="rounded-[28px] border border-white/10 bg-[#020617]/90 p-5">
              <h2 className="text-sm font-semibold text-white">Stone Details</h2>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <DetailBlock label="Stone Type" value={item.stoneType || "—"} />
                <DetailBlock label="Category" value={item.category || "—"} />
                <DetailBlock label="Carat" value={formatCarat(item.carat) || "—"} />
                <DetailBlock label="Color" value={item.color || "—"} />
                <DetailBlock label="Cut" value={item.cut || "—"} />
                <DetailBlock label="Origin" value={item.origin || "—"} />
                <DetailBlock
                  label="Quantity"
                  value={
                    item.quantity !== null &&
                    item.quantity !== undefined &&
                    item.quantity !== ""
                      ? String(item.quantity)
                      : "1"
                  }
                />
                <DetailBlock label="Price" value={formatMoney(item.salePrice)} />
              </div>
            </section>

            {item.notes ? (
              <section className="rounded-[28px] border border-white/10 bg-[#020617]/90 p-5">
                <h2 className="text-sm font-semibold text-white">Notes</h2>
                <div className="mt-3 rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 text-sm leading-7 text-gray-300">
                  {item.notes}
                </div>
              </section>
            ) : null}
          </section>
        </div>
      </div>
    </>
  );
}

export default StoneDetail;