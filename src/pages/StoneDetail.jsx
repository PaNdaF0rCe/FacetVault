import { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, MessageCircle } from "lucide-react";
import {
  getPublicStoneById,
  getRelatedPublicStones,
} from "../lib/firebase/inventory-operations";

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
  if (!value) return null;

  return (
    <div className="flex justify-between gap-4 border-b border-white/10 py-3 text-sm">
      <span className="text-white/60">{label}</span>
      <span className="text-white text-right">{value}</span>
    </div>
  );
}

function RelatedCard({ stone }) {
  return (
    <Link
      to={`/stone/${stone.id}`}
      className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="aspect-[4/3] overflow-hidden bg-white/5">
        <img
          src={stone.thumbnailUrl || stone.imageUrl}
          alt={stone.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-sm font-medium text-white line-clamp-1">
          {stone.name || stone.stoneType}
        </h3>

        <p className="text-xs text-white/60 line-clamp-1">
          {stone.stoneCode || stone.origin}
        </p>

        {stone.pricePaid ? (
          <p className="text-sm font-semibold text-amber-300">
            {formatMoney(stone.pricePaid)}
          </p>
        ) : null}
      </div>
    </Link>
  );
}

function Skeleton() {
  return (
    <div className="animate-pulse grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="aspect-square bg-white/10 rounded-2xl" />
      <div className="space-y-4">
        <div className="h-8 w-2/3 bg-white/10 rounded" />
        <div className="h-4 w-1/3 bg-white/10 rounded" />
        <div className="h-24 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default function StoneDetail() {
  const { id } = useParams();

  const { data: stone, isLoading } = useQuery({
    queryKey: ["stone", id],
    queryFn: () => getPublicStoneById(id),
    enabled: !!id,
  });

  const { data: related = [] } = useQuery({
    queryKey: ["related", id],
    queryFn: () => getRelatedPublicStones(stone, 4),
    enabled: !!stone,
  });

  const whatsappLink = useMemo(() => {
    if (!stone) return "#";

    const msg = `Hi, I'm interested in this stone:
${stone.name || stone.stoneType}
${stone.stoneCode || ""}
${window.location.href}`;

    return `https://wa.me/94774126030?text=${encodeURIComponent(msg)}`;
  }, [stone]);

  if (isLoading) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10">
        <Skeleton />
      </section>
    );
  }

  if (!stone) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-10 text-center text-white">
        Stone not found
      </section>
    );
  }

  return (
    <>
      <Helmet>
        <title>{stone.name || "Stone"} | FacetVault</title>
      </Helmet>

      <section className="max-w-7xl mx-auto px-4 py-10">
        {/* Back */}
        <Link
          to="/collection"
          className="flex items-center gap-2 text-sm text-white/70 hover:text-white mb-6"
        >
          <ChevronLeft size={16} />
          Back to Collection
        </Link>

        {/* Main */}
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* Image */}
          <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
            <img
              src={stone.imageUrl || stone.thumbnailUrl}
              alt={stone.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h1 className="text-3xl text-white font-semibold">
              {stone.name || stone.stoneType}
            </h1>

            {stone.pricePaid && (
              <p className="mt-4 text-2xl text-amber-300 font-semibold">
                {formatMoney(stone.pricePaid)}
              </p>
            )}

            <div className="mt-6">
              <DetailRow label="Type" value={stone.stoneType} />
              <DetailRow label="Carat" value={stone.carat} />
              <DetailRow label="Color" value={stone.color} />
              <DetailRow label="Cut" value={stone.cut} />
              <DetailRow label="Origin" value={stone.origin} />
              <DetailRow label="Treatment" value={stone.treatment} />
            </div>

            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 bg-amber-300 text-black px-5 py-3 rounded-full font-semibold"
            >
              <MessageCircle size={18} />
              Inquire
            </a>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl text-white mb-4">Related Stones</h2>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {related.map((s) => (
                <RelatedCard key={s.id} stone={s} />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}