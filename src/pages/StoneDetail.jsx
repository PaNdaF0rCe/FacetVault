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

  const canonicalUrl = `https://facet-vault.vercel.app/stone/${id}`;
  const ogImage =
    item?.imageUrl || "https://facet-vault.vercel.app/StockSmart-AI.png";

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

        <div className="p-6 text-white">
          <p>Loading stone...</p>
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

        <div className="p-6 text-white">
          <h1 className="text-xl font-semibold">Stone not found</h1>
          <p className="mt-2 text-gray-400">
            This gemstone may have been removed or is no longer available.
          </p>
        </div>
      </>
    );
  }

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

      <div className="mx-auto max-w-5xl px-4 py-6 text-white">
        <h1 className="text-2xl font-semibold text-amber-300">
          {item.name || "Untitled Gem"}
        </h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-white/10">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name || "Gemstone"}
                className="w-full object-cover"
              />
            ) : (
              <div className="p-10 text-center text-gray-500">
                No image available
              </div>
            )}
          </div>

          <div className="space-y-4">
            <p><strong>Type:</strong> {item.stoneType || "—"}</p>
            <p><strong>Category:</strong> {item.category || "—"}</p>
            <p><strong>Carat:</strong> {formatCarat(item.carat) || "—"}</p>
            <p><strong>Color:</strong> {item.color || "—"}</p>
            <p><strong>Cut:</strong> {item.cut || "—"}</p>
            <p><strong>Origin:</strong> {item.origin || "—"}</p>
            <p><strong>Price:</strong> {formatMoney(item.salePrice)}</p>

            {item.notes ? (
              <div className="mt-4">
                <p className="text-sm text-gray-400">Notes</p>
                <p className="mt-1">{item.notes}</p>
              </div>
            ) : null}

            <a
              href={buildWhatsAppLink(item)}
              target="_blank"
              rel="noreferrer"
              className="mt-6 block rounded-xl bg-amber-400 px-4 py-3 text-center font-semibold text-black hover:bg-amber-300"
            >
              Ask About This Stone
            </a>

            {CONTACT_PHONE ? (
              <p className="mt-2 text-center text-sm text-gray-400">
                {CONTACT_PHONE}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
}

export default StoneDetail;