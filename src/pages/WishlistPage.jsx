import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import { useWishlist } from "../hooks/useWishlist";

function WishCard({ item, onRemove }) {
  const isSold = item?.isSold === true;
  const price = Number(item?.salePrice ?? item?.pricePaid);
  const imgSrc = item.thumbnailUrl || item.mediumUrl || item.imageUrl;

  return (
    <article className="lux-card-elevated group flex flex-col overflow-hidden">
      <Link to={`/stone/${item.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-[#04101f]">
          {imgSrc ? (
            <img
              src={imgSrc}
              alt={item.name || "Gemstone"}
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[11px] text-white/28">
              No image
            </div>
          )}
          {isSold && (
            <span className="absolute right-2 top-2 rounded-full border border-rose-300/20 bg-rose-300/12 px-2 py-0.5 text-[10px] font-medium text-rose-200 backdrop-blur">
              Sold
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-3">
        <h2 className="line-clamp-2 text-[13px] font-semibold leading-[1.3] text-white">
          {item.name || "Untitled"}
        </h2>
        <p className="mt-1 text-[11px] text-white/42">
          {item.stoneType || item.category || "Gem"}
        </p>

        {isSold ? (
          <p className="mt-2 text-[13px] font-medium text-rose-200">
            Recently sold
          </p>
        ) : !Number.isNaN(price) && price > 0 ? (
          <p className="mt-2 font-display text-[16px] font-semibold tracking-tight text-amber-300">
            LKR {price.toLocaleString()}
          </p>
        ) : null}

        <div className="mt-auto flex gap-2 pt-3">
          <Link
            to={`/stone/${item.id}`}
            className="flex-1 rounded-xl border border-white/8 bg-white/[0.025] py-2.5 text-center text-[13px] font-medium text-white transition-colors hover:border-amber-300/18 hover:text-amber-200"
          >
            View Stone
          </Link>
          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label="Remove from wishlist"
            className="flex items-center justify-center rounded-xl border border-rose-300/12 bg-rose-300/8 px-3 py-2.5 text-rose-300 transition-colors hover:bg-rose-300/14 active:scale-[0.97]"
          >
            <Heart size={14} fill="currentColor" />
          </button>
        </div>
      </div>
    </article>
  );
}

export default function WishlistPage() {
  const { ids, toggle } = useWishlist();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["public-sale-inventory-for-detail"],
    queryFn: getPublicSaleInventory,
    staleTime: 1000 * 60 * 5,
  });

  const saved = useMemo(
    () => inventory.filter((i) => ids.includes(i.id)),
    [inventory, ids]
  );

  return (
    <>
      <Helmet>
        <title>Saved Stones | FacetVault Wishlist</title>
        <meta
          name="description"
          content="Your saved FacetVault gemstones — revisit the stones you love."
        />
      </Helmet>

      <div className="mx-auto w-full max-w-[1600px] px-4 py-10 sm:px-6 lg:px-8">
        <p className="lux-eyebrow-rule text-[10px] text-amber-300/75">
          Your Saved Stones
        </p>
        <h1 className="lux-display mt-4 text-[2rem] text-white sm:text-[2.4rem]">
          Wishlist
        </h1>

        {isLoading ? (
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-[22px] border border-white/8 bg-[#04101f]"
              >
                <div className="aspect-[4/3] bg-white/[0.05]" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-2/3 rounded bg-white/[0.05]" />
                  <div className="h-3 w-1/3 rounded bg-white/[0.05]" />
                </div>
              </div>
            ))}
          </div>
        ) : ids.length === 0 ? (
          <div className="mt-12 rounded-[28px] border border-white/8 bg-white/[0.03] p-10 text-center">
            <Heart
              size={36}
              className="mx-auto mb-4 text-white/20"
              strokeWidth={1.4}
            />
            <p className="text-lg font-semibold text-white">
              No saved stones yet
            </p>
            <p className="mt-2 text-sm text-white/45">
              Tap the heart icon on any stone to save it here.
            </p>
            <Link
              to="/collection"
              className="mt-6 inline-flex items-center justify-center rounded-full border border-white/10 bg-white/[0.03] px-5 py-3 text-sm font-medium text-white transition-colors hover:border-amber-300/20 hover:text-amber-200"
            >
              Browse Collection
            </Link>
          </div>
        ) : (
          <>
            <p className="mt-5 text-[13px] text-white/40">
              {saved.length} saved stone{saved.length !== 1 ? "s" : ""}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
              {saved.map((item) => (
                <WishCard key={item.id} item={item} onRemove={toggle} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
