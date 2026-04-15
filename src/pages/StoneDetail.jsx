import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import { WHATSAPP_NUMBER } from "../config/appConfig";

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

function formatMoney(value) {
  if (!value && value !== 0) return "Price on request";
  return `LKR ${Number(value).toLocaleString()}`;
}

function formatCarat(value) {
  if (!value && value !== 0) return null;
  return `${value} ct`;
}

function buildWhatsAppLink(item) {
  const message = `Hi, I’m interested in this ${item.name} [${
    item.stoneCode || "N/A"
  }].`;

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}

function DetailBlock({ label, value }) {
  if (!value && value !== 0) return null;

  return (
    <div className="rounded-xl border border-white/10 p-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm text-white mt-1">{value}</p>
    </div>
  );
}

function StoneDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [item, setItem] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getPublicSaleInventory();
      const clean = data.filter((i) => !i.isSold);

      setItems(clean);
      setItem(clean.find((i) => i.id === id) || null);
    };

    load();
  }, [id]);

  const related = useMemo(() => {
    if (!item) return [];

    return items
      .filter(
        (i) =>
          i.id !== item.id &&
          (i.stoneType === item.stoneType ||
            i.category === item.category)
      )
      .slice(0, 4);
  }, [items, item]);

  if (!item)
    return (
      <div className="p-6 text-white">
        <button onClick={() => navigate(-1)}>← Back</button>
        <p className="mt-4">Stone not found</p>
      </div>
    );

  return (
    <div className="p-4 text-white max-w-6xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="text-amber-300">
        ← Back
      </button>

      {/* HEADER */}
      <div>
        <h1 className="text-3xl text-amber-300 font-semibold">
          {item.name}
        </h1>

        {item.stoneCode && (
          <p className="text-xs text-gray-500 mt-1">
            {item.stoneCode}
          </p>
        )}

        <div className="flex gap-2 mt-2">
          {item.isFeatured && (
            <span className="text-xs px-2 py-1 bg-amber-400 text-black rounded">
              Featured
            </span>
          )}
          {item.isCollectorPiece && (
            <span className="text-xs px-2 py-1 bg-purple-400 text-black rounded">
              Collector
            </span>
          )}
          {isNew(item) && (
            <span className="text-xs px-2 py-1 bg-blue-400 text-black rounded">
              New
            </span>
          )}
        </div>
      </div>

      {/* MAIN */}
      <div className="grid md:grid-cols-2 gap-6">
        <img src={item.imageUrl} className="rounded-xl" />

        <div>
          <p className="text-gray-400 text-sm">Price</p>
          <p className="text-2xl text-white font-semibold mb-4">
            {formatMoney(item.salePrice)}
          </p>

          <a
            href={buildWhatsAppLink(item)}
            target="_blank"
            rel="noreferrer"
            className="block bg-amber-400 text-black text-center py-3 rounded-lg font-semibold"
          >
            Secure this stone
          </a>

          <div className="grid grid-cols-2 gap-3 mt-6">
            <DetailBlock label="Stone Type" value={item.stoneType} />
            <DetailBlock label="Category" value={item.category} />
            <DetailBlock label="Carat" value={formatCarat(item.carat)} />
            <DetailBlock label="Color" value={item.color} />
            <DetailBlock label="Cut" value={item.cut} />
            <DetailBlock label="Origin" value={item.origin} />
          </div>

          {item.notes && (
            <div className="mt-6">
              <p className="text-sm text-gray-400 mb-1">Notes</p>
              <p className="text-sm text-white">{item.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div>
          <h2 className="text-xl text-white mb-3">Related Stones</h2>

          <div className="grid grid-cols-2 gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/stone/${r.id}`}
                className="border border-white/10 rounded-xl overflow-hidden"
              >
                <img src={r.imageUrl} className="aspect-square object-cover" />
                <div className="p-2 text-sm text-white">
                  {r.name}
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