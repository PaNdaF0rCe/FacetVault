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
    <div className="lux-card p-3">
      <p className="text-xs text-gray-400">{label}</p>
      <p className="mt-1 text-sm text-white">{value}</p>
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
      <div className="p-6 text-white">
        <button onClick={() => navigate(-1)}>← Back</button>
        <p className="mt-4">Stone not found</p>
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
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 text-white">
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-amber-300 hover:text-amber-200"
      >
        ← Back
      </button>

      <div>
        <h1 className="text-3xl font-semibold text-white">{item.name}</h1>

        {item.stoneCode && (
          <p className="mt-1 text-xs text-gray-500">{item.stoneCode}</p>
        )}

        <div className="mt-3 flex gap-2">
          {item.isFeatured && (
            <span className="rounded-full bg-amber-400/20 px-2 py-1 text-xs text-amber-300">
              Featured
            </span>
          )}
          {item.isCollectorPiece && (
            <span className="rounded-full bg-purple-400/20 px-2 py-1 text-xs text-purple-300">
              Collector
            </span>
          )}
          {isNew(item) && (
            <span className="rounded-full bg-blue-400/20 px-2 py-1 text-xs text-blue-300">
              New
            </span>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="lux-card overflow-hidden">
          <img src={item.imageUrl} className="w-full object-cover" alt={item.name} />
        </div>

        <div>
          <p className="text-sm text-gray-400">Price</p>
          <p className="mt-1 text-3xl font-semibold text-amber-300">{primaryPrice}</p>

          {secondaryPrice ? (
            <p className="mt-2 text-sm text-gray-400">{secondaryPrice}</p>
          ) : null}

          {showDisclaimer ? (
            <p className="mt-2 text-xs text-gray-500">
              Converted from LKR using daily exchange rates. Final confirmed price may
              vary slightly.
            </p>
          ) : null}

          <a
            href={buildWhatsAppLink(item)}
            target="_blank"
            rel="noreferrer"
            className="lux-button-primary mt-6 w-full"
          >
            Secure this stone
          </a>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <DetailBlock label="Stone Type" value={item.stoneType} />
            <DetailBlock label="Category" value={item.category} />
            <DetailBlock label="Carat" value={formatCarat(item.carat)} />
            <DetailBlock label="Color" value={item.color} />
            <DetailBlock label="Cut" value={item.cut} />
            <DetailBlock label="Origin" value={item.origin} />
          </div>

          {item.notes && (
            <div className="mt-6">
              <p className="mb-1 text-sm text-gray-400">Notes</p>
              <p className="text-sm leading-relaxed text-white">{item.notes}</p>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <div>
          <h2 className="mb-4 text-xl font-semibold text-white">Related Stones</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/stone/${r.id}`}
                className="lux-card overflow-hidden"
              >
                <img
                  src={r.imageUrl}
                  className="aspect-square w-full object-cover"
                  alt={r.name}
                />
                <div className="p-3 text-sm text-white">{r.name}</div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default StoneDetail;