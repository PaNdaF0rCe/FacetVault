import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import { WHATSAPP_NUMBER } from "../config/appConfig";
import {
  getExchangeRates,
  detectCurrency,
  convertFromLkr,
  formatCurrency,
} from "../lib/services/exchangeRates";

const NEW_DAYS = 14;

function getJsDate(value) {
  if (!value) return null;
  if (typeof value?.toDate === "function") return value.toDate();
  if (value?.seconds) return new Date(value.seconds * 1000);
  return new Date(value);
}

function isNew(item) {
  const date = getJsDate(item?.createdAt);
  if (!date) return false;
  const diff = (new Date() - date) / (1000 * 60 * 60 * 24);
  return diff <= NEW_DAYS;
}

function formatCarat(value) {
  if (!value && value !== 0) return null;
  return `${value} ct`;
}

function buildWhatsAppLink(item) {
  const message = `Hi, I’m interested in this ${item.name} [${
    item.stoneCode || "N/A"
  }].`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

function DetailBlock({ label, value }) {
  if (!value && value !== 0) return null;

  return (
    <div className="lux-card p-3 sm:p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-gray-500">
        {label}
      </p>
      <p className="mt-1 text-sm leading-relaxed text-white sm:text-[15px]">
        {value}
      </p>
    </div>
  );
}

function StoneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);
  const [rates, setRates] = useState(null);
  const currency = detectCurrency();

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await getPublicSaleInventory();
        const clean = Array.isArray(data) ? data.filter((i) => !i.isSold) : [];

        if (mounted) {
          setItems(clean);
          setItem(clean.find((i) => i.id === id) || null);
        }
      } catch (error) {
        console.error("Failed to load stone detail:", error);
        if (mounted) {
          setItems([]);
          setItem(null);
        }
      }
    };

    const loadRates = async () => {
      try {
        const rateData = await getExchangeRates();
        if (mounted) {
          setRates(rateData);
        }
      } catch (error) {
        console.error("Failed to load exchange rates:", error);
      }
    };

    load();
    loadRates();

    return () => {
      mounted = false;
    };
  }, [id]);

  const related = useMemo(() => {
    if (!item) return [];

    return items
      .filter(
        (i) =>
          i.id !== item.id &&
          (i.stoneType === item.stoneType || i.category === item.category)
      )
      .slice(0, 4);
  }, [items, item]);

  if (!item) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-6 text-white sm:px-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-amber-300 transition hover:text-amber-200"
        >
          ← Back
        </button>
        <p className="mt-4 text-sm text-gray-300">Stone not found</p>
      </div>
    );
  }

  const price = Number(item.salePrice);
  const hasValidPrice = !Number.isNaN(price);

  let primaryPrice = "Price on request";
  let secondaryPrice = null;
  let showDisclaimer = false;

  if (hasValidPrice) {
    if (currency === "LKR" || !rates?.rates) {
      primaryPrice = `LKR ${price.toLocaleString()}`;
    } else {
      const converted = convertFromLkr(price, currency, rates.rates);

      if (converted) {
        primaryPrice = `Approx. ${formatCurrency(converted, currency)}`;
        secondaryPrice = `Base price: LKR ${price.toLocaleString()}`;
        showDisclaimer = true;
      } else {
        primaryPrice = `LKR ${price.toLocaleString()}`;
      }
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-5 text-white sm:space-y-8 sm:px-6 sm:py-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex text-sm text-amber-300 transition hover:text-amber-200"
      >
        ← Back
      </button>

      <div className="space-y-3">
        <div>
          <h1 className="text-2xl font-semibold leading-tight text-white sm:text-3xl">
            {item.name}
          </h1>

          {item.stoneCode && (
            <p className="mt-1 text-xs tracking-[0.14em] text-gray-500">
              {item.stoneCode}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {item.isFeatured && (
            <span className="rounded-full bg-amber-400/20 px-2.5 py-1 text-xs text-amber-300">
              Featured
            </span>
          )}
          {item.isCollectorPiece && (
            <span className="rounded-full bg-purple-400/20 px-2.5 py-1 text-xs text-purple-300">
              Collector
            </span>
          )}
          {isNew(item) && (
            <span className="rounded-full bg-blue-400/20 px-2.5 py-1 text-xs text-blue-300">
              New
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 md:gap-8">
        <div className="lux-card overflow-hidden">
          <img
            src={item.imageUrl}
            className="aspect-square w-full object-cover"
            alt={item.name}
          />
        </div>

        <div className="flex flex-col">
          <p className="text-sm text-gray-400">Price</p>
          <p className="mt-1 text-2xl font-semibold leading-tight text-amber-300 sm:text-3xl">
            {primaryPrice}
          </p>

          {secondaryPrice ? (
            <p className="mt-2 text-sm text-gray-400">{secondaryPrice}</p>
          ) : null}

          {showDisclaimer ? (
            <p className="mt-2 text-xs leading-relaxed text-gray-500">
              Converted from LKR using daily exchange rates. Final confirmed
              price may vary slightly.
            </p>
          ) : null}

          <a
            href={buildWhatsAppLink(item)}
            target="_blank"
            rel="noreferrer"
            className="lux-button-primary mt-5 w-full sm:mt-6"
          >
            Secure this stone
          </a>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2">
            <DetailBlock label="Stone Type" value={item.stoneType} />
            <DetailBlock label="Category" value={item.category} />
            <DetailBlock label="Carat" value={formatCarat(item.carat)} />
            <DetailBlock label="Color" value={item.color} />
            <DetailBlock label="Cut" value={item.cut} />
            <DetailBlock label="Origin" value={item.origin} />
          </div>

          {item.notes && (
            <div className="mt-5 sm:mt-6">
              <p className="mb-1 text-sm text-gray-400">Notes</p>
              <p className="text-sm leading-relaxed text-white/90">
                {item.notes}
              </p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-white sm:text-xl">
            Related Stones
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/stone/${r.id}`}
                className="lux-card overflow-hidden transition hover:-translate-y-0.5"
              >
                <img
                  src={r.imageUrl}
                  className="aspect-square w-full object-cover"
                  alt={r.name}
                />
                <div className="p-3">
                  <p className="line-clamp-1 text-sm font-medium text-white">
                    {r.name}
                  </p>
                  {r.stoneCode ? (
                    <p className="mt-1 text-xs text-gray-500">{r.stoneCode}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoneDetail;