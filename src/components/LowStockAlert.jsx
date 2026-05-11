import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { AlertCircle } from "lucide-react";
import { db } from "../lib/firebase/config";

function LowStockAlert({ userId, threshold = 3 }) {
  const [lowStockItems, setLowStockItems] = useState([]);

  useEffect(() => {
    const fetchLowStockItems = async () => {
      const q = query(
        collection(db, "inventory"),
        where("userId", "==", userId),
        where("quantity", "<=", threshold)
      );

      const querySnapshot = await getDocs(q);
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setLowStockItems(items);
    };

    fetchLowStockItems();
  }, [userId, threshold]);

  return (
    <section
      className="lux-card-elevated p-5"
      aria-live="polite"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-300">
          <AlertCircle size={16} strokeWidth={1.8} />
        </span>
        <div>
          <p className="lux-eyebrow text-[10px] text-amber-300/75">
            Inventory
          </p>
          <h3 className="text-[15px] font-semibold text-white">
            Low Stock Alert
          </h3>
        </div>
      </div>

      {lowStockItems.length > 0 ? (
        <ul className="mt-4 divide-y divide-white/5 overflow-hidden rounded-xl border border-white/8 bg-white/[0.02]">
          {lowStockItems.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between px-4 py-3 text-[13px]"
            >
              <span className="truncate text-white/80">{item.name}</span>
              <span className="ml-3 inline-flex shrink-0 items-center gap-1.5 rounded-full border border-amber-300/25 bg-amber-300/10 px-2.5 py-0.5 text-[11px] font-medium text-amber-200">
                {item.quantity} left
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-[13px] text-white/50">
          Everything is well-stocked.
        </p>
      )}
    </section>
  );
}

export default LowStockAlert;
