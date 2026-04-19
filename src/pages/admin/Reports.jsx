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

  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
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

  const last10 = filteredSales.slice(0, 10);

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
              Profit & Loss
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-white/50">
              View sales performance, recent transactions, and export your report.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-4 py-3 text-sm font-semibold text-[#09101c] transition hover:brightness-105"
          >
            Download Report (CSV)
          </button>
        </div>

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
                Recent Sales
              </h2>
              <p className="mt-1 text-sm text-white/45">
                Last 10 transactions for the selected range.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-4 text-sm text-white/50">Loading...</p>
          ) : last10.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-white/8 bg-white/[0.03] p-5 text-sm text-white/50">
              No sales yet.
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-3 md:hidden">
                {last10.map((sale) => (
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
                    {last10.map((s) => (
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
      </div>
    </div>
  );
}