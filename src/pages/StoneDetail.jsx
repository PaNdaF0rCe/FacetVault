import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MessageCircle } from "lucide-react";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import { WHATSAPP_NUMBER } from "../config/appConfig";

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

function RelatedCard({ stone }) {
  const salePrice = Number(stone?.salePrice ?? stone?.pricePaid);

  return (
    <Link
      to={`/stone/${stone.id}`}
      className="group overflow-hidden rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))] transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-0.5 hover:border-amber-300/18 hover:shadow-[0_18px_42px_rgba(0,0,0,0.22)]"
    >
      <div className="aspect-[4/3] overflow-hidden bg-[#04101f]">
        <img
          src={stone.thumbnailUrl || stone.imageUrl}
          alt={stone.name || stone.stoneType || "Gemstone"}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="space-y-1.5 p-4">
        <h3 className="line-clamp-1 text-sm font-semibold text-white">
          {stone.name || stone.stoneType || "Untitled Stone"}
        </h3>

        <p className="line-clamp-1 text-[11px] text-white/42">
          {stone.stoneType || stone.category || "Gem"}
        </p>

        {!Number.isNaN(salePrice) && salePrice > 0 ? (
          <p className="text-[13px] font-semibold text-amber-300">
            {formatMoney(salePrice)}
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

  const salePrice = Number(stone?.salePrice ?? stone?.pricePaid);

  const whatsappLink = useMemo(() => {
    if (!stone) return "#";

    const msg = `Hi, I'm interested in this stone from FacetVault:
${stone.name || stone.stoneType || "Gemstone"}
${stone.stoneCode ? `Code: ${stone.stoneCode}` : ""}
${typeof window !== "undefined" ? window.location.href : ""}`.trim();

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
  }, [stone]);

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
        <title>{stone.name || stone.stoneType || "Stone"} | FacetVault</title>
        <meta
          name="description"
          content={`Explore ${stone.name || stone.stoneType || "this gemstone"} on FacetVault.`}
        />
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
          <div className="overflow-hidden rounded-[32px] border border-white/8 bg-[#04101f] shadow-[0_22px_50px_rgba(0,0,0,0.18)]">
            <img
              src={stone.imageUrl || stone.thumbnailUrl}
              alt={stone.name || stone.stoneType || "Gemstone"}
              className="h-full w-full object-cover"
              decoding="async"
            />
          </div>

          <div className="pt-1">
            <p className="text-[10px] uppercase tracking-[0.32em] text-amber-300/68">
              FacetVault Collection
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {stone.name || stone.stoneType || "Untitled Stone"}
            </h1>

            {(stone.stoneType || stone.category) && (
              <p className="mt-2 text-sm text-white/42">
                {stone.stoneType || stone.category}
              </p>
            )}

            {!Number.isNaN(salePrice) && salePrice > 0 ? (
              <p className="mt-5 text-2xl font-semibold text-amber-300">
                {formatMoney(salePrice)}
              </p>
            ) : null}

            <div className="mt-7">
              <DetailRow label="Stone Code" value={stone.stoneCode} />
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

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-[#09101c] transition-[transform,filter] duration-200 hover:brightness-105 active:scale-[0.98]"
            >
              <MessageCircle size={18} />
              Inquire on WhatsApp
            </a>
          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <p className="text-[10px] uppercase tracking-[0.3em] text-amber-300/68">
              You may also like
            </p>
            <h2 className="mt-3 text-2xl font-semibold text-white">
              Related Stones
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((item) => (
                <RelatedCard key={item.id} stone={item} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}