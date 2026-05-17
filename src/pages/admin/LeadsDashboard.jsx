import { useCallback, useEffect, useMemo, useState } from "react";
import {
  collection, getDocs, orderBy, query,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { MessageCircle, Phone, Tag, Clock, ChevronDown, Edit3, Check, X } from "lucide-react";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  "new", "replied", "interested", "negotiating", "reserved",
  "sold", "lost", "not_interested", "support",
];

// Keep backward compat — old statuses that may exist in Firestore
const LEGACY_STATUS_MAP = { contacted: "replied", closed: "sold" };

const statusStyles = {
  new:            "border-blue-400/30 bg-blue-400/10 text-blue-200",
  replied:        "border-amber-300/30 bg-amber-300/10 text-amber-200",
  interested:     "border-violet-300/30 bg-violet-300/10 text-violet-200",
  negotiating:    "border-purple-300/30 bg-purple-300/10 text-purple-200",
  reserved:       "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  sold:           "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
  lost:           "border-red-300/30 bg-red-300/10 text-red-200",
  not_interested: "border-white/15 bg-white/5 text-white/40",
  support:        "border-sky-300/30 bg-sky-300/10 text-sky-200",
  // legacy fallbacks
  contacted:      "border-amber-300/30 bg-amber-300/10 text-amber-200",
  closed:         "border-emerald-300/30 bg-emerald-300/10 text-emerald-200",
};

const scoreStyles = {
  hot:    "border-red-400/40 bg-red-500/10 text-red-200",
  medium: "border-amber-300/40 bg-amber-300/10 text-amber-200",
  low:    "border-white/15 bg-white/5 text-white/55",
};

const intentLevelStyles = {
  high:    "text-red-300",
  medium:  "text-amber-300",
  low:     "text-white/40",
  none:    "text-white/25",
  support: "text-sky-300",
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function resolveStatus(raw) {
  return LEGACY_STATUS_MAP[raw] || raw || "new";
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "—";
  return timestamp.toDate().toLocaleString("en-LK", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatFollowUp(timestamp) {
  if (!timestamp?.toDate) return null;
  const d = timestamp.toDate();
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffH = diffMs / (1000 * 60 * 60);
  if (diffH < 0) return { label: "Overdue", urgent: true };
  if (diffH < 24) return { label: `Follow up in ${Math.round(diffH)}h`, urgent: true };
  return { label: `Follow up ${d.toLocaleDateString("en-LK", { month: "short", day: "numeric" })}`, urgent: false };
}

function Pill({ children, className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.14em] ${className}`}>
      {children}
    </span>
  );
}

// ── Inline notes editor ───────────────────────────────────────────────────────

function NotesField({ leadId, initialNotes }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initialNotes || "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "leads", leadId), {
        notes: value,
        updatedAt: serverTimestamp(),
      });
      setEditing(false);
    } catch (err) {
      console.error("Failed to save notes:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-3">
      <div className="flex items-center justify-between mb-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/30">Notes</p>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2 py-1 text-[10px] text-white/35 hover:text-white/60 transition"
          >
            <Edit3 size={9} /> {value ? "Edit" : "Add note"}
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/8 px-2 py-1 text-[10px] text-emerald-300 transition"
            >
              <Check size={9} /> Save
            </button>
            <button
              type="button"
              onClick={() => { setValue(initialNotes || ""); setEditing(false); }}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2 py-1 text-[10px] text-white/35 hover:text-white/60 transition"
            >
              <X size={9} /> Cancel
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          className="w-full rounded-xl border border-white/12 bg-black/20 px-3 py-2 text-sm text-white/80 outline-none focus:border-amber-300/30 resize-none leading-relaxed"
          rows={3}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Add a note about this lead…"
          autoFocus
        />
      ) : value ? (
        <p className="text-[13px] leading-relaxed text-white/55 italic">"{value}"</p>
      ) : (
        <p className="text-[12px] text-white/22">No notes yet</p>
      )}
    </div>
  );
}

// ── Lead card ─────────────────────────────────────────────────────────────────

function LeadCard({ lead, onStatusChange }) {
  const status = resolveStatus(lead.status);
  const score = lead.leadScore || "low";
  const followUp = formatFollowUp(lead.followUpAt);
  const isHot = score === "hot" || lead.needsHuman;
  const isSupport = status === "support" || lead.intent === "existing_buyer_support";

  return (
    <div className={`rounded-2xl border bg-white/[0.035] p-4 shadow-xl shadow-black/10 transition hover:bg-white/[0.05] sm:p-5 ${
      isHot ? "border-red-400/30" : isSupport ? "border-sky-400/25" : "border-white/10"
    }`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        {/* Left: lead info */}
        <div className="min-w-0 flex-1">
          {/* Score + Status + Date */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Pill className={scoreStyles[score] || scoreStyles.low}>
              {score}
            </Pill>
            <Pill className={statusStyles[status] || statusStyles.new}>
              {status.replace(/_/g, " ")}
            </Pill>
            {lead.needsHuman && status !== "sold" && status !== "lost" && status !== "not_interested" && (
              <Pill className="border-rose-400/35 bg-rose-500/10 text-rose-200 animate-pulse">
                needs reply
              </Pill>
            )}
            {isSupport && (
              <Pill className="border-sky-400/30 bg-sky-400/8 text-sky-300">
                support
              </Pill>
            )}
            <span className="text-xs text-white/30">{formatDate(lead.createdAt)}</span>
          </div>

          {/* Platform + Intent */}
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.18em]">
            <span className="text-white/35">{lead.platform || "unknown"}</span>
            {lead.intent && (
              <span className="text-white/25">· {lead.intent.replace(/_/g, " ")}</span>
            )}
            {lead.intentLevel && (
              <span className={`font-semibold ${intentLevelStyles[lead.intentLevel] || "text-white/35"}`}>
                · {lead.intentLevel} intent
              </span>
            )}
            {lead.language && (
              <span className="text-white/25">· {lead.language}</span>
            )}
          </div>

          {/* Message */}
          <p className="mb-3 text-[14px] leading-relaxed text-white/85">
            "{lead.latestMessage || lead.message}"
          </p>

          {/* Tags row */}
          <div className="mb-3 flex flex-wrap gap-2">
            {lead.stoneCode && (
              <span className="flex items-center gap-1 rounded-lg border border-amber-300/25 bg-amber-300/8 px-2.5 py-1.5 text-[11px] text-amber-200">
                <Tag size={10} />
                {lead.stoneCode}
              </span>
            )}
            {lead.interestedCategory && (
              <span className="rounded-lg border border-white/10 bg-white/4 px-2.5 py-1.5 text-[11px] text-white/50">
                {lead.interestedCategory}
              </span>
            )}
            {lead.whatsappNumber && (
              <span className="flex items-center gap-1 rounded-lg border border-emerald-400/25 bg-emerald-400/8 px-2.5 py-1.5 text-[11px] text-emerald-300">
                <Phone size={10} />
                WhatsApp
              </span>
            )}
            {(lead.tags || []).filter(t => t !== "high_intent" && t !== "low_purchase_intent").map((tag) => (
              <span key={tag} className="rounded-lg border border-white/8 bg-white/3 px-2 py-1 text-[10px] text-white/35">
                {tag.replace(/_/g, " ")}
              </span>
            ))}
          </div>

          {/* Suggested next action */}
          {lead.suggestedNextAction && status !== "sold" && status !== "not_interested" && (
            <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/28 mb-1">Suggested action</p>
              <p className="text-[13px] text-white/65">{lead.suggestedNextAction}</p>
            </div>
          )}

          {/* Follow-up date */}
          {followUp && (
            <div className={`mt-2.5 flex items-center gap-1.5 text-[12px] ${followUp.urgent ? "text-rose-300" : "text-white/40"}`}>
              <Clock size={11} />
              {followUp.label}
            </div>
          )}

          {/* Notes */}
          <NotesField leadId={lead.id} initialNotes={lead.notes} />
        </div>

        {/* Right: status selector */}
        <div className="w-full lg:w-52">
          <label className="mb-2 block text-[11px] uppercase tracking-[0.2em] text-white/30">
            Status
          </label>
          <select
            value={status}
            onChange={(e) => onStatusChange(lead.id, e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none focus:border-amber-300/25"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option.charAt(0).toUpperCase() + option.slice(1).replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* WhatsApp quick-link */}
          {(lead.whatsappNumber || lead.senderId) && (
            <a
              href={lead.whatsappNumber
                ? `https://wa.me/${lead.whatsappNumber}`
                : `https://wa.me/94702755420?text=Hi%2C%20following%20up`}
              target="_blank"
              rel="noreferrer"
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-emerald-400/25 bg-emerald-400/8 px-3 py-2.5 text-[12px] font-semibold text-emerald-300 transition hover:bg-emerald-400/14"
            >
              <MessageCircle size={13} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function LeadsDashboard() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [scoreFilter, setScoreFilter] = useState("all");
  const [intentFilter, setIntentFilter] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "leads"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setLeads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Error loading leads:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = async (leadId, status) => {
    try {
      await updateDoc(doc(db, "leads", leadId), {
        status,
        updatedAt: serverTimestamp(),
      });
      setLeads((prev) =>
        prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
      );
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const status = resolveStatus(lead.status);
      const score = lead.leadScore || "low";
      const intentLevel = lead.intentLevel || (score === "hot" ? "high" : score === "medium" ? "medium" : "low");

      const statusOk = statusFilter === "all" || status === statusFilter;
      const scoreOk = scoreFilter === "all" || score === scoreFilter;
      const intentOk = intentFilter === "all" || intentLevel === intentFilter;

      return statusOk && scoreOk && intentOk;
    });
  }, [leads, statusFilter, scoreFilter, intentFilter]);

  // Sort: needs-human + hot first, then most recent
  const sortedLeads = useMemo(() => {
    return [...filteredLeads].sort((a, b) => {
      const aPriority = (a.needsHuman ? 2 : 0) + (a.leadScore === "hot" ? 1 : 0);
      const bPriority = (b.needsHuman ? 2 : 0) + (b.leadScore === "hot" ? 1 : 0);
      if (bPriority !== aPriority) return bPriority - aPriority;
      const aTime = a.createdAt?.toDate?.()?.getTime() || 0;
      const bTime = b.createdAt?.toDate?.()?.getTime() || 0;
      return bTime - aTime;
    });
  }, [filteredLeads]);

  const stats = useMemo(() => ({
    total:       leads.length,
    hot:         leads.filter((l) => l.leadScore === "hot").length,
    needsReply:  leads.filter((l) => l.needsHuman && !["sold","lost","not_interested"].includes(resolveStatus(l.status))).length,
    sold:        leads.filter((l) => resolveStatus(l.status) === "sold").length,
  }), [leads]);

  if (loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl animate-pulse space-y-5">
          <div className="h-8 w-48 rounded-2xl bg-white/[0.05]" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl border border-white/8 bg-white/[0.04]" />
            ))}
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-2xl border border-white/8 bg-white/[0.04]" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-xs uppercase tracking-[0.28em] text-amber-300">
              FacetVault CRM
            </p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Leads & Inquiries
            </h1>
            <p className="mt-2 max-w-xl text-sm text-white/45">
              Track buyer intent, qualify leads, and manage follow-ups.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/4 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/50 transition hover:bg-white/8 sm:hidden"
            >
              Filters <ChevronDown size={12} className={showFilters ? "rotate-180" : ""} />
            </button>
            <button
              onClick={fetchLeads}
              className="rounded-full border border-amber-300/25 bg-amber-300/10 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200 transition hover:bg-amber-300/15"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            ["Total Leads", stats.total, ""],
            ["Hot Leads", stats.hot, "text-red-300"],
            ["Needs Reply", stats.needsReply, stats.needsReply > 0 ? "text-rose-300" : ""],
            ["Sold", stats.sold, "text-emerald-400"],
          ].map(([label, value, cls]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[11px] uppercase tracking-[0.22em] text-white/35">{label}</p>
              <p className={`mt-2 text-2xl font-semibold ${cls}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={`mb-5 ${showFilters ? "block" : "hidden sm:block"}`}>
          <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 sm:grid-cols-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ")}</option>
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

            <select
              value={intentFilter}
              onChange={(e) => setIntentFilter(e.target.value)}
              className="rounded-xl border border-white/10 bg-[#07111f] px-4 py-3 text-sm text-white outline-none"
            >
              <option value="all">All Intent Levels</option>
              <option value="high">High Intent</option>
              <option value="medium">Medium Intent</option>
              <option value="low">Low Intent</option>
              <option value="support">Support</option>
              <option value="none">No Intent</option>
            </select>
          </div>

          {/* Active filter summary */}
          {(statusFilter !== "all" || scoreFilter !== "all" || intentFilter !== "all") && (
            <div className="mt-2 flex items-center gap-2 text-xs text-white/40">
              <span>Showing {sortedLeads.length} of {leads.length} leads</span>
              <button
                onClick={() => { setStatusFilter("all"); setScoreFilter("all"); setIntentFilter("all"); }}
                className="text-amber-300/60 hover:text-amber-300 transition"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        {/* Empty state */}
        {sortedLeads.length === 0 && (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-white/55">No leads match your current filters.</p>
          </div>
        )}

        {/* Leads */}
        <div className="grid gap-4">
          {sortedLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onStatusChange={updateStatus}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
