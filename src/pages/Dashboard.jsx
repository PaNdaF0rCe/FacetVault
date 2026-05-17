import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import FilterBar from "../components/FilterBar";
import InventoryItemCard from "../components/InventoryItemCard";
import Toast from "../components/Toast";
import { getFilteredInventory } from "../lib/firebase/inventory-operations";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase/config";

function normalizeDateMs(value) {
  if (!value) return 0;
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  if (value instanceof Date) return value.getTime();
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

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
      {Array.from({ length: 8 }).map((_, index) => (
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

// ── action data hook ─────────────────────────────────────────────────────────

function useActionData() {
  const [data, setData] = useState({ pendingDrafts: 0, failedDrafts: 0, unrepliedLeads: 0, hotLeads: 0 });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [draftSnap, leadSnap] = await Promise.all([
          getDocs(query(
            collection(db, "marketingDrafts"),
            where("status", "in", [
              "pending", "awaiting_image", "awaiting_question_selection",
              "failed_generation", "failed_image", "failed_publish",
            ])
          )),
          getDocs(collection(db, "leads")),
        ]);

        if (cancelled) return;

        const drafts = draftSnap.docs.map((d) => d.data());
        const leads  = leadSnap.docs.map((d)  => d.data());

        const pendingDrafts = drafts.filter((d) =>
          ["pending", "awaiting_image", "awaiting_question_selection"].includes(d.status)
        ).length;

        const failedDrafts = drafts.filter((d) =>
          ["failed_generation", "failed_image", "failed_publish"].includes(d.status)
        ).length;

        const unrepliedLeads = leads.filter((l) =>
          ["new"].includes(l.status) || (!l.status && l.intent)
        ).length;

        const hotLeads = leads.filter((l) =>
          /high/i.test(l.intentLevel || l.intentCategory || l.intent || "")
        ).length;

        setData({ pendingDrafts, failedDrafts, unrepliedLeads, hotLeads });
      } catch (err) {
        console.error("Action data load error:", err);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  return data;
}

// ── today's actions section ───────────────────────────────────────────────────

function TodayActions({ pendingDrafts, failedDrafts, unrepliedLeads, navigate }) {
  const items = [
    pendingDrafts > 0 && {
      label: `${pendingDrafts} draft${pendingDrafts > 1 ? "s" : ""} waiting for approval`,
      path:  "/admin/drafts",
      color: "border-amber-300/20 bg-amber-300/6 text-amber-200",
      dot:   "bg-amber-300",
    },
    failedDrafts > 0 && {
      label: `${failedDrafts} draft${failedDrafts > 1 ? "s" : ""} failed — needs attention`,
      path:  "/admin/drafts",
      color: "border-red-300/20 bg-red-300/6 text-red-200",
      dot:   "bg-red-400",
    },
    unrepliedLeads > 0 && {
      label: `${unrepliedLeads} new lead${unrepliedLeads > 1 ? "s" : ""} haven't been replied to`,
      path:  "/admin/leads",
      color: "border-sky-300/20 bg-sky-300/6 text-sky-200",
      dot:   "bg-sky-400",
    },
  ].filter(Boolean);

  if (items.length === 0) return null;

  return (
    <section className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))] p-4 sm:p-5">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.26em] text-white/35">
        Today's Actions
      </p>
      <div className="flex flex-col gap-2">
        {items.map(({ label, path, color, dot }) => (
          <button
            key={label}
            type="button"
            onClick={() => navigate(path)}
            className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-[12px] font-medium transition hover:brightness-110 ${color}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${dot}`} />
            {label}
            <span className="ml-auto text-[11px] opacity-50">→</span>
          </button>
        ))}
      </div>
    </section>
  );
}

// ── business overview section ─────────────────────────────────────────────────

function BusinessOverview({ allGems, hotLeads, pendingDrafts, navigate }) {
  const forSale  = allGems.filter((g) => g.isForSale && !g.isSold).length;
  const sold     = allGems.filter((g) => g.isSold).length;

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[
        { label: "For Sale",      value: forSale,       path: "/admin",         accent: false },
        { label: "Hot Leads",     value: hotLeads,      path: "/admin/leads",   accent: hotLeads > 0 },
        { label: "Pending Posts", value: pendingDrafts, path: "/admin/drafts",  accent: pendingDrafts > 0 },
        { label: "Sold",          value: sold,          path: "/admin/reports", accent: false },
      ].map(({ label, value, path, accent }) => (
        <button
          key={label}
          type="button"
          onClick={() => navigate(path)}
          className="rounded-[22px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-4 text-left transition hover:border-white/14 hover:bg-white/[0.04]"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-white/42">{label}</p>
          <p className={`mt-2 text-2xl font-semibold ${accent ? "text-amber-300" : "text-white"}`}>
            {value}
          </p>
        </button>
      ))}
    </section>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [allGems, setAllGems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const { pendingDrafts, failedDrafts, unrepliedLeads, hotLeads } = useActionData();

  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sortBy: "createdAt",
  });

  const showToast = useCallback((nextToast) => {
    setToast(null);
    window.setTimeout(() => setToast(nextToast), 10);
  }, []);

  const fetchGems = useCallback(async () => {
    if (!user?.uid) return;
    setIsLoading(true);
    try {
      const items = await getFilteredInventory(user.uid);
      setAllGems(items);
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
  }, [user?.uid, showToast]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  // All filtering and sorting happens client-side — no redundant Firestore fetches.
  const gems = useMemo(() => {
    let result = [...allGems];

    const term = filters.search?.trim().toLowerCase();
    if (term) {
      result = result.filter(
        (i) =>
          (i.name || "").toLowerCase().includes(term) ||
          (i.stoneCode || "").toLowerCase().includes(term)
      );
    }

    if (filters.category) {
      result = result.filter((i) => i.category === filters.category);
    }

    switch (filters.sortBy) {
      case "updatedAt":
        result.sort((a, b) => normalizeDateMs(b.updatedAt) - normalizeDateMs(a.updatedAt));
        break;
      case "name":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "carat":
        result.sort((a, b) => Number(b.carat || 0) - Number(a.carat || 0));
        break;
      case "pricePaid":
        result.sort((a, b) => Number(b.pricePaid || 0) - Number(a.pricePaid || 0));
        break;
      default:
        // "createdAt" — already sorted descending by Firestore
        break;
    }

    return result;
  }, [allGems, filters]);

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

        <section className="lux-card-elevated p-5 sm:p-6 lg:p-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <p className="lux-eyebrow-rule text-[10px]">
                Personal inventory
              </p>

              <h1 className="lux-display mt-3 text-[2rem] text-white sm:text-[2.6rem]">
                My Gem Collection
              </h1>

              <p className="mt-3 max-w-xl text-[14px] leading-6 text-white/55 sm:text-[15px]">
                Manage your stones, review details quickly, and keep your
                collection organized in one place.
              </p>
            </div>

              <div className="flex flex-wrap items-center gap-3 sm:self-start lg:self-auto">
              <button
                type="button"
                onClick={() => navigate("/admin/add")}
                className="lux-button-primary"
              >
                Add New Gem
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin/reports")}
                className="inline-flex items-center justify-center rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-white/20"
              >
                Reports & Profit
              </button>
            </div>

          </div>
        </section>

        <TodayActions
          pendingDrafts={pendingDrafts}
          failedDrafts={failedDrafts}
          unrepliedLeads={unrepliedLeads}
          navigate={navigate}
        />

        <BusinessOverview
          allGems={allGems}
          hotLeads={hotLeads}
          pendingDrafts={pendingDrafts}
          navigate={navigate}
        />

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
          totalItems={allGems.length}
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