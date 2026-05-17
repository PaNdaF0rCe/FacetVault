import { useEffect, useMemo, useState } from "react";
import { db } from "../../lib/firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../../contexts/AuthContext";

// ── marketing insights helpers ────────────────────────────────────────────────

const POST_TYPE_LABELS = {
  feature:          "Feature",
  mystery:          "Mystery",
  origin:           "Informative",
  quiz:             "Gem Quiz",
  stone_to_jewelry: "Stone→Jewelry",
  birthstone:       "Birthstone",
  trust:            "Trust",
  how_to_buy:       "How to Buy",
  faq:              "FAQ",
};

function isFailedStatus(s) {
  return ["failed_generation", "failed_image", "failed_publish"].includes(s);
}

function MarketingInsights() {
  const [drafts, setDrafts]   = useState([]);
  const [leads, setLeads]     = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const [draftSnap, leadSnap] = await Promise.all([
          getDocs(collection(db, "marketingDrafts")),
          getDocs(collection(db, "leads")),
        ]);
        setDrafts(draftSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLeads(leadSnap.docs.map((d)  => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error("Marketing insights load error:", err);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const draftStats = useMemo(() => {
    const published = drafts.filter((d) => d.status === "published").length;
    const pending   = drafts.filter((d) => ["pending", "awaiting_image", "awaiting_question_selection"].includes(d.status)).length;
    const approved  = drafts.filter((d) => d.status === "approved").length;
    const rejected  = drafts.filter((d) => d.status === "rejected").length;
    const failed    = drafts.filter((d) => isFailedStatus(d.status)).length;

    // Post type distribution (published only)
    const byType = {};
    drafts.filter((d) => d.status === "published").forEach((d) => {
      const t = d.postType || "unknown";
      byType[t] = (byType[t] || 0) + 1;
    });
    const typeRows = Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .map(([type, count]) => ({ type, label: POST_TYPE_LABELS[type] || type, count }));

    return { total: drafts.length, published, pending, approved, rejected, failed, typeRows };
  }, [drafts]);

  const leadStats = useMemo(() => {
    const resolve = (l) => l.intentLevel || l.intentCategory || l.intent || "";

    const hot      = leads.filter((l) => /high/i.test(resolve(l))).length;
    const medium   = leads.filter((l) => /medium/i.test(resolve(l))).length;
    const support  = leads.filter((l) => /support/i.test(resolve(l)) || l.status === "support").length;
    const sold     = leads.filter((l) => l.status === "sold").length;
    const lost     = leads.filter((l) => l.status === "lost" || l.status === "not_interested").length;
    const total    = leads.length;

    return { total, hot, medium, support, sold, lost };
  }, [leads]);

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <div className="h-7 w-7 rounded-full border-2 border-amber-300/30 border-t-amber-300 animate-spin" />
      </div>
    );
  }

  const maxTypeCount = Math.max(1, ...draftStats.typeRows.map((r) => r.count));

  return (
    <div className="space-y-8 mt-6">
      {/* draft pipeline summary */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
          Content Pipeline
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Total Generated",  value: draftStats.total,     color: "text-white" },
            { label: "Published",        value: draftStats.published, color: "text-emerald-400" },
            { label: "Pending / Queue",  value: draftStats.pending + draftStats.approved, color: "text-amber-300" },
            { label: "Rejected",         value: draftStats.rejected,  color: "text-white/50" },
            { label: "Failed",           value: draftStats.failed,    color: "text-red-300" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">{label}</p>
              <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* post type breakdown */}
      {draftStats.typeRows.length > 0 && (
        <div>
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
            Posts Published by Type
          </p>
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-4 space-y-3">
            {draftStats.typeRows.map(({ type, label, count }) => (
              <div key={type} className="flex items-center gap-3">
                <p className="w-32 shrink-0 text-[11px] text-white/60">{label}</p>
                <div className="flex-1 rounded-full bg-white/6 h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full bg-amber-300/70 transition-all"
                    style={{ width: `${(count / maxTypeCount) * 100}%` }}
                  />
                </div>
                <p className="w-6 shrink-0 text-right text-[11px] font-semibold text-white/70">{count}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* lead funnel */}
      <div>
        <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
          Lead Funnel — {leadStats.total} total
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {[
            { label: "Hot Leads",     value: leadStats.hot,     color: "text-amber-300" },
            { label: "Medium Leads",  value: leadStats.medium,  color: "text-white" },
            { label: "Support",       value: leadStats.support, color: "text-sky-300" },
            { label: "Sold",          value: leadStats.sold,    color: "text-emerald-400" },
            { label: "Lost / Cold",   value: leadStats.lost,    color: "text-white/42" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-white/38">{label}</p>
              <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* conversion note */}
      {leadStats.total > 0 && (
        <div className="rounded-2xl border border-white/6 bg-white/[0.02] p-4">
          <p className="text-[11px] text-white/35">
            Lead → Sale conversion:{" "}
            <span className="font-semibold text-emerald-400/80">
              {((leadStats.sold / leadStats.total) * 100).toFixed(1)}%
            </span>
            {" "}· Hot lead rate:{" "}
            <span className="font-semibold text-amber-300/80">
              {((leadStats.hot / leadStats.total) * 100).toFixed(1)}%
            </span>
          </p>
        </div>
      )}
    </div>
  );
}

function formatMoney(val) {
  if (val === null || val === undefined) return "—";
  return `LKR ${Number(val).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  })}`;
}

function formatDateFromTimestamp(value) {
  if (!value) return "—";

  if (typeof value?.toDate === "function") {
    return value.toDate().toLocaleDateString();
  }

  if (typeof value?.seconds === "number") {
    return new Date(value.seconds * 1000).toLocaleDateString();
  }

  return new Date(value).toLocaleDateString();
}

function getDateRange(filter) {
  const now = new Date();

  if (filter === "7") {
    return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  }

  if (filter === "30") {
    return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  return null;
}

function FilterPill({ active, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-amber-400 text-[#09101c]"
          : "bg-white/8 text-white/80 hover:bg-white/12"
      }`}
    >
      {label}
    </button>
  );
}

function SummaryCard({ label, value, valueClassName = "" }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.04] p-4">
      <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">
        {label}
      </p>
      <p className={`mt-2 text-xl font-semibold text-white ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}

function MobileSaleCard({ sale }) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">
            {sale.stoneName || "Unnamed Stone"}
          </p>
          <p className="mt-1 text-xs text-white/45">
            {sale.stoneCode || "No code"}
          </p>
        </div>

        <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
          Sold
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/38">
            Date
          </p>
          <p className="mt-1 text-sm text-white">
            {formatDateFromTimestamp(sale.soldAt)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/38">
            Cost
          </p>
          <p className="mt-1 text-sm text-white">
            {formatMoney(sale.costPrice)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/38">
            Sold
          </p>
          <p className="mt-1 text-sm text-white">
            {formatMoney(sale.sellingPrice)}
          </p>
        </div>

        <div>
          <p className="text-[11px] uppercase tracking-[0.12em] text-white/38">
            Profit
          </p>
          <p className="mt-1 text-sm font-semibold text-emerald-400">
            {formatMoney(sale.profit)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("pl"); // "pl" | "marketing"
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [range, setRange] = useState("all");

  useEffect(() => {
    if (!user?.uid) return;

    const loadSales = async () => {
      try {
        setLoading(true);

        const q = query(
          collection(db, "sales"),
          where("userId", "==", user.uid),
          orderBy("soldAt", "desc")
        );

        const snap = await getDocs(q);
        const data = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));

        setSales(data);
      } catch (error) {
        console.error("Error loading sales:", error);
        setLoadError(true);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
  }, [user?.uid]);

  const filteredSales = useMemo(() => {
    const cutoff = getDateRange(range);
    if (!cutoff) return sales;

    return sales.filter((s) => {
      const saleDate =
        typeof s.soldAt?.toDate === "function"
          ? s.soldAt.toDate()
          : typeof s.soldAt?.seconds === "number"
          ? new Date(s.soldAt.seconds * 1000)
          : new Date(s.soldAt);

      return saleDate >= cutoff;
    });
  }, [sales, range]);

  const summary = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    let profit = 0;

    filteredSales.forEach((s) => {
      revenue += Number(s.sellingPrice || 0);
      cost += Number(s.costPrice || 0);
      profit += Number(s.profit || 0);
    });

    return {
      revenue,
      cost,
      profit,
      count: filteredSales.length,
    };
  }, [filteredSales]);

  const [showAll, setShowAll] = useState(false);
  const visibleSales = showAll ? filteredSales : filteredSales.slice(0, 10);

  const exportCSV = () => {
    const rows = [
      [
        "Date",
        "Stone",
        "Code",
        "Cost",
        "Selling Price",
        "Expenses",
        "Profit",
      ],
    ];

    filteredSales.forEach((s) => {
      rows.push([
        formatDateFromTimestamp(s.soldAt),
        s.stoneName || "",
        s.stoneCode || "",
        s.costPrice || 0,
        s.sellingPrice || 0,
        s.expenses || 0,
        s.profit || 0,
      ]);
    });

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "facetvault-sales.csv";
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-5 text-white sm:px-6 lg:px-8">
      <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.98))] p-4 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300/70">
              FacetVault Reports
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {activeTab === "pl" ? "Profit & Loss" : "Marketing Insights"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/50">
              {activeTab === "pl"
                ? "View sales performance, recent transactions, and export your report."
                : "Content pipeline, post type breakdown, and lead conversion data."}
            </p>
          </div>

          {activeTab === "pl" && (
            <button
              type="button"
              onClick={exportCSV}
              className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-[#09101c] transition hover:brightness-105"
            >
              Download Report (CSV)
            </button>
          )}
        </div>

        {/* tab bar */}
        <div className="mt-5 flex gap-1 overflow-x-auto pb-1 border-b border-white/8">
          {[
            { key: "pl",        label: "Profit & Loss" },
            { key: "marketing", label: "Marketing Insights" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`shrink-0 rounded-t-lg px-4 py-2.5 text-sm font-medium transition -mb-px border-b-2 ${
                activeTab === key
                  ? "border-amber-300 text-amber-300"
                  : "border-transparent text-white/45 hover:text-white/70"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* marketing insights tab */}
        {activeTab === "marketing" && <MarketingInsights />}

        {/* P&L date filters — only show on P&L tab */}
        {activeTab === "pl" && (
        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          <FilterPill
            active={range === "all"}
            label="All Time"
            onClick={() => setRange("all")}
          />
          <FilterPill
            active={range === "7"}
            label="Last 7 Days"
            onClick={() => setRange("7")}
          />
          <FilterPill
            active={range === "30"}
            label="Last 30 Days"
            onClick={() => setRange("30")}
          />
        </div>
        )}

        {activeTab === "pl" && (<>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <SummaryCard label="Revenue" value={formatMoney(summary.revenue)} />
          <SummaryCard label="Cost" value={formatMoney(summary.cost)} />
          <SummaryCard
            label="Profit"
            value={formatMoney(summary.profit)}
            valueClassName="text-emerald-400"
          />
          <SummaryCard label="Sales" value={summary.count} />
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white sm:text-xl">
                Sales
              </h2>
              <p className="mt-1 text-sm text-white/45">
                {filteredSales.length} transaction{filteredSales.length === 1 ? "" : "s"} in selected range.
              </p>
            </div>
            {filteredSales.length > 10 && (
              <button
                type="button"
                onClick={() => setShowAll((v) => !v)}
                className="shrink-0 rounded-full border border-white/8 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white/70 transition hover:border-white/14 hover:text-white"
              >
                {showAll ? "Show less" : `Show all ${filteredSales.length}`}
              </button>
            )}
          </div>

          {loadError && (
            <div className="mt-4 rounded-2xl border border-rose-300/20 bg-rose-300/8 p-4 text-sm text-rose-200">
              Could not load sales data. Please refresh the page.
            </div>
          )}

          {loading ? (
            <p className="mt-4 text-sm text-white/50">Loading...</p>
          ) : filteredSales.length === 0 && !loadError ? (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-sm text-white/50">
              No sales yet.
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-3 md:hidden">
                {visibleSales.map((sale) => (
                  <MobileSaleCard key={sale.id} sale={sale} />
                ))}
              </div>

              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[720px] text-sm">
                  <thead className="text-left text-white/45">
                    <tr className="border-b border-white/10">
                      <th className="pb-3 pr-4 font-medium">Date</th>
                      <th className="pb-3 pr-4 font-medium">Stone</th>
                      <th className="pb-3 pr-4 font-medium">Code</th>
                      <th className="pb-3 pr-4 font-medium">Cost</th>
                      <th className="pb-3 pr-4 font-medium">Sold</th>
                      <th className="pb-3 font-medium">Profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleSales.map((s) => (
                      <tr
                        key={s.id}
                        className="border-b border-white/8 last:border-b-0"
                      >
                        <td className="py-3 pr-4 text-white/78">
                          {formatDateFromTimestamp(s.soldAt)}
                        </td>
                        <td className="py-3 pr-4 text-white">
                          {s.stoneName || "Unnamed Stone"}
                        </td>
                        <td className="py-3 pr-4 text-white/78">
                          {s.stoneCode || "—"}
                        </td>
                        <td className="py-3 pr-4 text-white/78">
                          {formatMoney(s.costPrice)}
                        </td>
                        <td className="py-3 pr-4 text-white/78">
                          {formatMoney(s.sellingPrice)}
                        </td>
                        <td className="py-3 font-semibold text-emerald-400">
                          {formatMoney(s.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
        </>)}
      </div>
    </div>
  );
}