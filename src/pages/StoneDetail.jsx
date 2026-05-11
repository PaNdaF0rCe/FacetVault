import { useMemo, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MessageCircle, Share2, Check } from "lucide-react";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import { WHATSAPP_NUMBER } from "../config/appConfig";
import { getActiveCampaign, applyDiscount } from "../lib/services/holidayCampaign";

function formatMoney(value) {
  if (value === null || value === undefined || value === "") return null;

  const num = Number(value);
  if (Number.isNaN(num)) return null;

  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(num);
}

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === "") return null;

  return (
    <div className="flex items-start justify-between gap-4 border-b border-white/8 py-3 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="max-w-[62%] text-right text-white/92">{value}</span>
    </div>
  );
}

function RelatedCard({ stone, campaign }) {
  const rawPrice = Number(stone?.salePrice ?? stone?.pricePaid);
  const isSold = stone?.isSold === true;
  const discountedPrice =
    campaign && !isSold && !Number.isNaN(rawPrice) && rawPrice > 0
      ? applyDiscount(rawPrice)
      : null;
  const hasDiscount = discountedPrice !== null && discountedPrice !== rawPrice;

  return (
    <Link
      to={`/stone/${stone.id}`}
      className="lux-card-elevated group block overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#04101f]">
        {(() => {
          const relSrc =
            stone.mediumUrl || stone.thumbnailUrl || stone.imageUrl;
          const relCandidates = [
            stone.thumbnailUrl ? `${stone.thumbnailUrl} 600w` : null,
            stone.mediumUrl ? `${stone.mediumUrl} 1000w` : null,
            stone.imageUrl ? `${stone.imageUrl} 1600w` : null,
          ].filter(Boolean);
          const relSrcSet =
            relCandidates.length > 1 ? relCandidates.join(", ") : undefined;

          return (
            <img
              src={relSrc}
              srcSet={relSrcSet}
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
              alt={stone.name || stone.stoneType || "Gemstone"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          );
        })()}

        {isSold && (
          <div className="absolute right-3 top-3 rounded-full border border-rose-300/20 bg-rose-300/12 px-3 py-1 text-xs font-medium text-rose-200 backdrop-blur">
            Sold
          </div>
        )}
      </div>

      <div className="space-y-1 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">
          {stone.name || stone.stoneType || "Untitled Stone"}
        </h3>

        <p className="line-clamp-1 text-[11px] text-white/42">
          {stone.stoneType || stone.category || "Gem"}
        </p>

        {isSold ? (
          <p className="text-[13px] font-semibold text-rose-200">Recently sold</p>
        ) : hasDiscount ? (
          <div>
            <p className="text-[11px] text-white/36 line-through">
              {formatMoney(rawPrice)}
            </p>
            <p className="font-display text-[15px] font-semibold tracking-tight text-amber-300">
              {formatMoney(discountedPrice)}
            </p>
          </div>
        ) : !Number.isNaN(rawPrice) && rawPrice > 0 ? (
          <p className="font-display text-[15px] font-semibold tracking-tight text-amber-300">
            {formatMoney(rawPrice)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="grid animate-pulse gap-8 lg:grid-cols-[1.12fr_0.88fr]">
      <div className="aspect-square rounded-[30px] bg-white/[0.05]" />
      <div className="space-y-4 p-1">
        <div className="h-7 w-2/3 rounded bg-white/[0.05]" />
        <div className="h-4 w-1/3 rounded bg-white/[0.05]" />
        <div className="h-20 rounded bg-white/[0.05]" />
        <div className="h-12 w-44 rounded-full bg-white/[0.05]" />
      </div>
    </div>
  );
}

export default function StoneDetail() {
  const { id } = useParams();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["public-sale-inventory-for-detail"],
    queryFn: getPublicSaleInventory,
    staleTime: 1000 * 60 * 5,
  });

  const stone = useMemo(() => {
    return inventory.find((item) => item.id === id) || null;
  }, [inventory, id]);

  const related = useMemo(() => {
    if (!stone) return [];

    return inventory
      .filter((item) => {
        if (item.id === stone.id) return false;

        const sameType =
          item.stoneType &&
          stone.stoneType &&
          item.stoneType.toLowerCase() === stone.stoneType.toLowerCase();

        const sameCategory =
          item.category &&
          stone.category &&
          item.category.toLowerCase() === stone.category.toLowerCase();

        return sameType || sameCategory;
      })
      .slice(0, 4);
  }, [inventory, stone]);

  const rawSalePrice = Number(stone?.salePrice ?? stone?.pricePaid);
  const isSold = stone?.isSold === true;
  const campaign = useMemo(() => getActiveCampaign(), []);
  const discountedPrice =
    campaign && !isSold && !Number.isNaN(rawSalePrice) && rawSalePrice > 0
      ? applyDiscount(rawSalePrice)
      : null;
  const hasDiscount = discountedPrice !== null && discountedPrice !== rawSalePrice;

  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const url = window.location.href;
    const shareData = {
      title: stone?.name || stone?.stoneType || "FacetVault Stone",
      text: `Check out this gemstone on FacetVault${stone?.stoneCode ? ` (${stone.stoneCode})` : ""}.`,
      url,
    };

    if (navigator.share && navigator.canShare?.(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user cancelled — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — ignore
    }
  }, [stone]);

  const whatsappLink = useMemo(() => {
    if (!stone || isSold) return "#";

    const priceNote = hasDiscount
      ? `Price: ${formatMoney(discountedPrice)} (${campaign.label})`
      : "";

    const msg = [
      `Hi, I'm interested in this stone from FacetVault:`,
      stone.name || stone.stoneType || "Gemstone",
      stone.stoneCode ? `Code: ${stone.stoneCode}` : "",
      priceNote,
      typeof window !== "undefined" ? window.location.href : "",
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [stone, isSold, hasDiscount, discountedPrice, campaign]);

  if (isLoading) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Skeleton />
      </section>
    );
  }

  if (!stone) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-[30px] border border-white/8 bg-white/[0.03] p-8 text-center">
          <p className="text-lg font-medium text-white">Stone not found</p>
          <p className="mt-2 text-sm text-white/45">
            This stone may no longer be publicly available.
          </p>

          <Link
            to="/collection"
            className="mt-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-amber-300/20 hover:bg-amber-300/8 hover:text-amber-200"
          >
            Back to Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{stone.name || stone.stoneType || "Gemstone"} {stone.carat ? `— ${stone.carat}ct` : ""} | FacetVault</title>
        <meta
          name="description"
          content={[
            stone.name || stone.stoneType || "Natural gemstone",
            stone.carat ? `${stone.carat}ct` : null,
            stone.color || null,
            stone.origin ? `from ${stone.origin}` : "from Sri Lanka",
            "available on FacetVault. Inquire directly via WhatsApp.",
          ].filter(Boolean).join(", ")}
        />
        <link rel="canonical" href={`https://facetvault.store/stone/${stone.id}`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={`https://facetvault.store/stone/${stone.id}`} />
        <meta property="og:title" content={`${stone.name || stone.stoneType || "Gemstone"} | FacetVault`} />
        <meta property="og:description" content={[stone.stoneType, stone.carat ? `${stone.carat}ct` : null, stone.color, stone.origin ? `Origin: ${stone.origin}` : null].filter(Boolean).join(" · ")} />
        <meta property="og:image" content={stone.imageUrl || stone.thumbnailUrl || "https://facetvault.store/logo.png"} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${stone.name || stone.stoneType || "Gemstone"} | FacetVault`} />
        <meta name="twitter:description" content={[stone.stoneType, stone.carat ? `${stone.carat}ct` : null, stone.color].filter(Boolean).join(" · ")} />
        <meta name="twitter:image" content={stone.imageUrl || stone.thumbnailUrl || "https://facetvault.store/logo.png"} />
        {!isSold && rawSalePrice > 0 && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": stone.name || stone.stoneType || "Gemstone",
            "description": [stone.stoneType, stone.carat ? `${stone.carat}ct` : null, stone.color, stone.cut, stone.origin ? `Origin: ${stone.origin}` : null, stone.treatment ? `Treatment: ${stone.treatment}` : null].filter(Boolean).join(". "),
            "image": stone.imageUrl || stone.thumbnailUrl || "https://facetvault.store/logo.png",
            "sku": stone.stoneCode || stone.id,
            "brand": { "@type": "Brand", "name": "FacetVault" },
            "offers": {
              "@type": "Offer",
              "url": `https://facetvault.store/stone/${stone.id}`,
              "priceCurrency": "LKR",
              "price": hasDiscount ? discountedPrice : rawSalePrice,
              "availability": "https://schema.org/InStock",
              "seller": { "@type": "Organization", "name": "FacetVault" }
            }
          })}</script>
        )}
        {isSold && (
          <script type="application/ld+json">{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": stone.name || stone.stoneType || "Gemstone",
            "image": stone.imageUrl || stone.thumbnailUrl || "https://facetvault.store/logo.png",
            "sku": stone.stoneCode || stone.id,
            "brand": { "@type": "Brand", "name": "FacetVault" },
            "offers": {
              "@type": "Offer",
              "url": `https://facetvault.store/stone/${stone.id}`,
              "priceCurrency": "LKR",
              "price": rawSalePrice || 0,
              "availability": "https://schema.org/SoldOut",
              "seller": { "@type": "Organization", "name": "FacetVault" }
            }
          })}</script>
        )}
      </Helmet>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to="/collection"
          className="mb-7 inline-flex items-center gap-2 text-sm text-white/50 transition-colors duration-200 hover:text-white"
        >
          <ChevronLeft size={16} />
          Back to Collection
        </Link>

        <div className="grid items-start gap-10 lg:grid-cols-[1.16fr_0.84fr]">
          <div className="relative overflow-hidden rounded-[32px] border border-white/8 bg-[#04101f] shadow-[0_22px_50px_rgba(0,0,0,0.18)]">
            {(() => {
              const heroSrc =
                stone.imageUrl || stone.mediumUrl || stone.thumbnailUrl;
              const heroCandidates = [
                stone.thumbnailUrl ? `${stone.thumbnailUrl} 600w` : null,
                stone.mediumUrl ? `${stone.mediumUrl} 1000w` : null,
                stone.imageUrl ? `${stone.imageUrl} 1600w` : null,
              ].filter(Boolean);
              const heroSrcSet =
                heroCandidates.length > 1
                  ? heroCandidates.join(", ")
                  : undefined;

              return (
                <img
                  src={heroSrc}
                  srcSet={heroSrcSet}
                  sizes="(max-width: 1024px) 100vw, 56vw"
                  alt={stone.name || stone.stoneType || "Gemstone"}
                  className="h-full w-full object-cover"
                  decoding="async"
                  fetchpriority="high"
                />
              );
            })()}

            {isSold && (
              <div className="absolute right-4 top-4 rounded-full border border-rose-300/20 bg-rose-300/12 px-3 py-1 text-xs font-medium text-rose-200 backdrop-blur">
                Sold
              </div>
            )}
          </div>

          <div className="pt-1">
            <p className="lux-eyebrow-rule text-[10px] text-amber-300/75">
              FacetVault Collection
            </p>

            <h1 className="lux-display mt-4 text-[2.1rem] text-white sm:text-[2.8rem]">
              {stone.name || stone.stoneType || "Untitled Stone"}
            </h1>

            {(stone.stoneType || stone.category) && (
              <p className="mt-2 text-[13.5px] uppercase tracking-[0.18em] text-white/45">
                {stone.stoneType || stone.category}
              </p>
            )}

            {isSold ? (
              <p className="lux-display mt-6 text-[1.6rem] text-rose-200/95">
                Recently sold
              </p>
            ) : !Number.isNaN(rawSalePrice) && rawSalePrice > 0 ? (
              <div className="mt-6">
                {hasDiscount ? (
                  <>
                    <p className="text-sm text-white/40 line-through">
                      {formatMoney(rawSalePrice)}
                    </p>
                    <p className="lux-display mt-0.5 text-[2rem] text-amber-300">
                      {formatMoney(discountedPrice)}
                    </p>
                    <p className="lux-pill lux-pill-gold mt-2.5">
                      {campaign.label}
                    </p>
                  </>
                ) : (
                  <p className="lux-display text-[2rem] text-amber-300">
                    {formatMoney(rawSalePrice)}
                  </p>
                )}
              </div>
            ) : null}

            <div className="mt-7">
              <DetailRow
                label="Stone Code"
                value={
                  stone.stoneCode ? (
                    <span className="font-mono tracking-wider">{stone.stoneCode}</span>
                  ) : null
                }
              />
              <DetailRow
                label="Carat"
                value={stone.carat ? `${stone.carat} ct` : null}
              />
              <DetailRow label="Color" value={stone.color} />
              <DetailRow label="Cut" value={stone.cut} />
              <DetailRow label="Origin" value={stone.origin} />
              <DetailRow label="Treatment" value={stone.treatment} />
              <DetailRow label="Category" value={stone.category} />
            </div>

            {stone.notes ? (
              <p className="mt-7 max-w-xl text-sm leading-7 text-white/60">
                {stone.notes}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap items-center gap-3">
              {isSold ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-rose-300/18 bg-rose-300/8 px-5 py-3 text-sm font-semibold text-rose-200">
                  This gemstone has been sold
                </div>
              ) : (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="lux-button-primary"
                >
                  <MessageCircle size={17} className="mr-2" strokeWidth={1.8} />
                  Inquire on WhatsApp
                </a>
              )}

              <button
                type="button"
                onClick={handleShare}
                title="Copy link"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-medium text-white/70 transition-[transform,border-color,color] duration-200 hover:border-white/20 hover:text-white active:scale-[0.98]"
              >
                {copied ? <Check size={16} /> : <Share2 size={16} />}
                {copied ? "Copied" : "Share"}
              </button>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-20">
            <p className="lux-eyebrow-rule text-[10px] text-amber-300/75">
              You may also like
            </p>
            <h2 className="lux-display mt-4 text-[1.85rem] text-white sm:text-[2.2rem]">
              Related Stones
            </h2>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <RelatedCard key={item.id} stone={item} campaign={campaign} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}