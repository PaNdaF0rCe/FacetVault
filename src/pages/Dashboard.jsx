import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FilterBar from "../components/FilterBar";
import InventoryItemCard from "../components/InventoryItemCard";
import Toast from "../components/Toast";
import { getFilteredInventory } from "../lib/firebase/inventory-operations";

function formatCarat(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";

  return `${num
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")} ct`;
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `LKR ${num.toLocaleString()}`;
}

function EmptyCollectionState({ onAddGem }) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))] shadow-[0_18px_50px_rgba(0,0,0,0.18)]">
      <div className="border-b border-white/8 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.08),transparent_42%),linear-gradient(180deg,rgba(7,18,36,0.9),rgba(2,6,23,0.96))] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-300/18 bg-amber-300/8 text-2xl text-amber-300 shadow-[0_10px_28px_rgba(251,191,36,0.08)]">
            ◇
          </div>

          <p className="mt-5 text-[10px] font-medium uppercase tracking-[0.3em] text-amber-300/72">
            Start your vault
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your collection is empty
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
            Add your first gem to begin organizing your personal inventory with
            photos, stone details, pricing, and notes.
          </p>

          <button
            type="button"
            onClick={onAddGem}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-amber-300 px-6 py-3 text-sm font-semibold text-[#09101c] shadow-sm transition duration-200 hover:brightness-105"
          >
            Add Your First Gem
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-8 sm:py-6">
        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">Track details</p>
          <p className="mt-2 text-sm leading-6 text-white/48">
            Save stone type, cut, origin, carat weight, quantity, and collection
            notes in one place.
          </p>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">Keep clear photos</p>
          <p className="mt-2 text-sm leading-6 text-white/48">
            Attach an image to each entry so your collection stays easier to
            browse and identify.
          </p>
        </div>

        <div className="rounded-[22px] border border-white/8 bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">Stay organized</p>
          <p className="mt-2 text-sm leading-6 text-white/48">
            Filter and sort entries as your collection grows without losing
            track of what you own.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 backdrop-blur-md">
      <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/42">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-white">
        {value}
      </p>
      {hint && <p className="mt-1 text-sm text-white/45">{hint}</p>}
    </div>
  );
}

function MobileSummaryBar({ totalEntries, totalCarats, totalValue }) {
  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.94),rgba(4,12,26,0.96))] px-3 py-3 sm:hidden">
      <div className="grid grid-cols-3 divide-x divide-white/8 text-center">
        <div className="px-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Gems
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {totalEntries.toLocaleString()}
          </p>
        </div>

        <div className="px-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Carats
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatCarat(totalCarats)}
          </p>
        </div>

        <div className="px-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-white/40">
            Value
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatPrice(totalValue)}
          </p>
        </div>
      </div>
    </section>
  );
}

function LoadingSkeletons() {
  return (
    <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))] p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-[18px] bg-white/[0.05] sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-2/3 rounded bg-white/[0.05]" />
              <div className="mt-3 h-4 w-1/3 rounded bg-white/[0.05]" />
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-white/[0.05]" />
                <div className="h-6 w-14 rounded-full bg-white/[0.05]" />
                <div className="h-6 w-20 rounded-full bg-white/[0.05]" />
              </div>
              <div className="mt-4 h-4 w-full rounded bg-white/[0.05]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [gems, setGems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sortBy: "createdAt",
  });

  const showToast = useCallback((nextToast) => {
    setToast(null);
    window.setTimeout(() => {
      setToast(nextToast);
    }, 10);
  }, []);

  const fetchGems = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);

    try {
      const items = await getFilteredInventory(user.uid, filters);
      setGems(items);
    } catch (error) {
      console.error("Error fetching gems:", error);
      showToast({
        type: "error",
        title: "Load failed",
        message: "Could not load your collection.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters, showToast]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  const totalEntries = useMemo(() => {
    return gems.reduce((sum, item) => {
      const qty = Number(item.quantity);
      return sum + (Number.isNaN(qty) ? 1 : qty || 1);
    }, 0);
  }, [gems]);

  const totalCarats = useMemo(() => {
    return gems.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const carat = Number(item.carat);
      const safeQty = Number.isNaN(qty) ? 1 : qty || 1;
      const safeCarat = Number.isNaN(carat) ? 0 : carat || 0;
      return sum + safeCarat * safeQty;
    }, 0);
  }, [gems]);

  const totalValue = useMemo(() => {
    return gems.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const price = Number(item.pricePaid);
      const safeQty = Number.isNaN(qty) ? 1 : qty || 1;
      const safePrice = Number.isNaN(price) ? 0 : price || 0;
      return sum + safePrice * safeQty;
    }, 0);
  }, [gems]);

  return (
    <div className="min-h-screen overflow-x-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1600px] space-y-4 sm:space-y-5 lg:space-y-6 2xl:px-2">
        <Toast toast={toast} onClose={() => setToast(null)} />

        <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,18,36,0.76),rgba(4,12,26,0.74))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-5 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-[10px] font-medium uppercase tracking-[0.3em] text-amber-300/72 sm:text-[11px]">
                Personal inventory
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                My Gem Collection
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-white/50 sm:text-base">
                Manage your stones, review details quickly, and keep your
                collection organized in one place.
              </p>
            </div>

            <button
                          type="button"
                          onClick={() => navigate("/admin/add")}
                          className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-[#09101c] shadow-sm transition duration-200 hover:brightness-105 sm:self-start lg:self-auto"
                        >
                          Add New Gem
                        </button>

            <button
              type="button"
              onClick={() => navigate("/admin/reports")}
              className="mt-3 inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
            >
              Reports & Profit
            </button>

          </div>
        </section>

        {!isLoading && gems.length > 0 && (
          <>
            <MobileSummaryBar
              totalEntries={totalEntries}
              totalCarats={totalCarats}
              totalValue={totalValue}
            />

            <section className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-3 xl:gap-5">
              <StatCard
                label="Total Entries"
                value={totalEntries.toLocaleString()}
                hint="Across your current filtered view"
              />
              <StatCard
                label="Total Carats"
                value={formatCarat(totalCarats)}
                hint="Combined carat weight"
              />
              <StatCard
                label="Total Value"
                value={formatPrice(totalValue)}
                hint="Based on recorded price paid"
              />
            </section>
          </>
        )}

        <FilterBar
          filters={filters}
          onFilterChange={setFilters}
          totalCount={gems.length}
          totalItems={gems.length}
        />

        {isLoading ? (
          <LoadingSkeletons />
        ) : gems.length === 0 ? (
          <EmptyCollectionState onAddGem={() => navigate("/admin/add")} />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:gap-5">
            {gems.map((item) => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onClick={() => navigate(`/admin/stone/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;