import { useEffect, useMemo, useState } from "react";
import {
  collection,
  getDocs,
  orderBy,
  query,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase/config";

const STATUS_OPTIONS = ["new", "contacted", "negotiating", "closed", "lost"];

const statusStyles = {
  new: "border-blue-400/30 bg-blue-400/10 text-blue-200",
  contacted: "border-amber-300/30 bg-amber-300/10 text-amber-200",
  negotiating: "border-purple-300/30 bg-purple-300/10 text-purple-200",
  closed: "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  lost: "border-red-300/30 bg-red-300/10 text-red-200",
};

const scoreStyles = {
  hot: "border-red-400/40 bg-red-500/10 text-red-200",
  medium: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  low: "border-white/15 bg-white/5 text-white/60",
};

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "Just now";

  return timestamp.toDate().toLocaleString("en-LK", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function Pill({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.16em] ${className}`}
    >
      {children}
    </span>
  );
}

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");

  const fetchLeads = async () => {
    setLoading(true);

    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      setLeads(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (leadId, status) => {
    await updateDoc(doc(db, "leads", leadId), {
      status,
      updatedAt: new Date(),
    });

    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
    );
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const statusMatch =
        statusFilter === "all" || (lead.status || "new") === statusFilter;

      const scoreMatch =
        scoreFilter === "all" || (lead.leadScore || "low") === scoreFilter;

      return statusMatch && scoreMatch;
    });
  }, [leads, statusFilter, scoreFilter]);

  const stats = useMemo(() => {
    return {
      total: leads.length,
      hot: leads.filter((lead) => lead.leadScore === "hot").length,
      new: leads.filter((lead) => (lead.status || "new") === "new").length,
      closed: leads.filter((lead) => lead.status === "closed").length,
    };
  }, [leads]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] px-4 py-10 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.24em] text-amber-300">
            Loading leads...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-amber-300">
              FacetVault CRM
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Leads Dashboard
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/50">
              Review buyer intent, track hot leads, and update sales progress.
            </p>
          </div>

          <button
            onClick={fetchLeads}
            className="w-full rounded-full border border-amber-300/25 bg-amber-300/10 px-5 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200 transition hover:bg-amber-300/15 sm:w-auto"
          >
            Refresh
          </button>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total", stats.total],
            ["Hot", stats.hot],
            ["New", stats.new],
            ["Closed", stats.closed],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
            >
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="mb-5 grid gap-3 rounded-2xl border border-white/10 bg-white/[0.035] p-3 sm:grid-cols-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Statuses</option>
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={scoreFilter}
            onChange={(e) => setScoreFilter(e.target.value)}
            className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none"
          >
            <option value="all">All Scores</option>
            <option value="hot">Hot</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Empty */}
        {filteredLeads.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-8 text-center">
            <p className="text-white/70">No leads found.</p>
          </div>
        )}

        {/* Leads */}
        <div className="grid gap-4">
          {filteredLeads.map((lead) => {
            const status = lead.status || "new";
            const score = lead.leadScore || "low";

            return (
              <div
                key={lead.id}
                className={`rounded-2xl border bg-white/[0.035] p-4 shadow-xl shadow-black/10 transition hover:bg-white/[0.055] sm:p-5 ${
                  score === "hot"
                    ? "border-red-400/30"
                    : "border-white/10"
                }`}
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Pill className={scoreStyles[score] || scoreStyles.low}>
                        {score}
                      </Pill>

                      <Pill
                        className={
                          statusStyles[status] || statusStyles.new
                        }
                      >
                        {status}
                      </Pill>

                      <span className="text-xs text-white/35">
                        {formatDate(lead.createdAt)}
                      </span>
                    </div>

                    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.2em] text-white/40">
                      <span>{lead.platform || "unknown"}</span>
                      {lead.intent && <span>• {lead.intent}</span>}
                      {lead.language && <span>• {lead.language}</span>}
                    </div>

                    <p className="mb-3 text-base leading-relaxed text-white/90">
                      “{lead.message}”
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {lead.stoneCode && (
                        <span className="rounded-lg border border-amber-300/25 bg-amber-300/10 px-3 py-1.5 text-xs text-amber-200">
                          Stone: {lead.stoneCode}
                        </span>
                      )}

                      {lead.needsHuman && (
                        <span className="rounded-lg border border-red-300/25 bg-red-300/10 px-3 py-1.5 text-xs text-red-200">
                          Needs manual check
                        </span>
                      )}
                    </div>

                    {lead.action && (
                      <p className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white/60">
                        <span className="text-white/35">Action:</span>{" "}
                        {lead.action}
                      </p>
                    )}
                  </div>

                  <div className="w-full lg:w-52">
                    <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/35">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => updateStatus(lead.id, e.target.value)}
                      className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}