import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { db } from "../../lib/firebase/config";
import { requestNotificationPermission, onForegroundMessage } from "../../lib/firebase/fcm";
import {
  CheckCircle, XCircle, RefreshCw, Bell, BellOff,
  Edit3, Check, X, Clock,
} from "lucide-react";
import { FaInstagram, FaFacebook } from "react-icons/fa";

// ── helpers ──────────────────────────────────────────────────────────────────

function formatTime(ts) {
  if (!ts?.toDate) return "";
  return ts.toDate().toLocaleString("en-LK", {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function formatScheduled(ts) {
  if (!ts?.toDate) return "immediately on approval";
  const d = ts.toDate();
  const now = new Date();
  if (d <= now) return "post immediately on approval";
  return d.toLocaleString("en-LK", {
    weekday: "short", hour: "2-digit", minute: "2-digit",
  });
}

const POST_TYPE_LABELS = {
  feature: "Feature Post",
  mystery: "Mystery Post",
  origin: "Informative Post",
};

// ── editable caption field ────────────────────────────────────────────────────

function EditableCaption({ value, onChange, label, lang = "en" }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  const commit = () => {
    onChange(draft);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(value);
    setEditing(false);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/36">{label}</p>
        {!editing ? (
          <button
            type="button"
            onClick={() => { setDraft(value); setEditing(true); }}
            className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1 text-[10px] text-white/40 hover:border-amber-300/30 hover:text-amber-200 transition"
          >
            <Edit3 size={10} /> Edit
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button type="button" onClick={commit} className="flex items-center gap-1 rounded-lg border border-emerald-400/30 bg-emerald-400/8 px-2.5 py-1 text-[10px] text-emerald-300 transition">
              <Check size={10} /> Save
            </button>
            <button type="button" onClick={cancel} className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/4 px-2.5 py-1 text-[10px] text-white/40 hover:text-white/70 transition">
              <X size={10} /> Cancel
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <textarea
          className={`w-full rounded-xl border border-amber-300/20 bg-obsidian-800 px-3 py-2.5 text-sm text-white/85 outline-none focus:border-amber-300/40 resize-none leading-relaxed ${lang === "si" ? "font-sans" : ""}`}
          rows={5}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          autoFocus
        />
      ) : (
        <p className={`text-sm leading-relaxed text-white/75 ${lang === "si" ? "" : ""}`}>{value || "—"}</p>
      )}
    </div>
  );
}

// ── draft card ────────────────────────────────────────────────────────────────

function DraftCard({ draft, onApprove, onReject }) {
  const [captionEn, setCaptionEn] = useState(draft.captionEn || "");
  const [captionSi, setCaptionSi] = useState(draft.captionSinhala || "");
  const [acting, setActing] = useState(null); // "approve" | "reject"

  const handleApprove = async () => {
    setActing("approve");
    await onApprove(draft.id, { captionEn, captionSinhala: captionSi });
  };

  const handleReject = async () => {
    setActing("reject");
    await onReject(draft.id);
  };

  const isOriginWaiting = draft.status === "awaiting_image";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="overflow-hidden rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(4,10,22,0.97),rgba(2,6,18,0.99))] shadow-lux-elevated"
    >
      {/* post image */}
      {(draft.brandedImageUrl || draft.originalImageUrl) ? (
        <div className="relative aspect-square w-full overflow-hidden bg-obsidian-900">
          <img
            src={draft.brandedImageUrl || draft.originalImageUrl}
            alt={draft.altText || draft.stoneName}
            className="h-full w-full object-cover"
          />
          {/* post type badge */}
          <div className="absolute left-3 top-3 rounded-full border border-white/14 bg-black/52 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
            {POST_TYPE_LABELS[draft.postType] || draft.postType}
          </div>
          {isOriginWaiting && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/62 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300/80 mb-1">Waiting for image</p>
              <p className="text-[12px] text-white/50 text-center px-6">Send a photo via Instagram DM or reply USE STONE</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex aspect-square w-full items-center justify-center bg-obsidian-800 text-4xl text-white/10">◇</div>
      )}

      {/* content */}
      <div className="p-5 space-y-4">
        {/* stone info */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-amber-300/70">{draft.stoneCode}</p>
            <h3 className="mt-0.5 text-base font-semibold text-white">
              {draft.stoneName}{draft.stoneCarat ? ` · ${draft.stoneCarat}ct` : ""}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-white/30">
            <FaInstagram size={13} />
            <FaFacebook size={13} />
          </div>
        </div>

        {/* scheduled time */}
        <div className="flex items-center gap-2 rounded-xl border border-white/6 bg-white/3 px-3 py-2">
          <Clock size={12} className="text-amber-300/50 flex-shrink-0" />
          <p className="text-[11px] text-white/50">{formatScheduled(draft.scheduledPostTime)}</p>
        </div>

        {/* captions */}
        {!isOriginWaiting && (
          <div className="space-y-4 border-t border-white/6 pt-4">
            <EditableCaption
              label="Caption · English"
              value={captionEn}
              onChange={setCaptionEn}
            />
            {captionSi && (
              <EditableCaption
                label="Caption · සිංහල"
                value={captionSi}
                onChange={setCaptionSi}
                lang="si"
              />
            )}
            {draft.hashtags && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/36 mb-1.5">Hashtags</p>
                <p className="text-[12px] text-sapphire-400/80 leading-relaxed">{draft.hashtags}</p>
              </div>
            )}
          </div>
        )}

        {/* approve / reject */}
        {!isOriginWaiting && (
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={handleApprove}
              disabled={!!acting}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-emerald-400/30 bg-emerald-400/10 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-emerald-300 transition hover:border-emerald-400/50 hover:bg-emerald-400/16 disabled:opacity-50"
            >
              {acting === "approve" ? <RefreshCw size={13} className="animate-spin" /> : <CheckCircle size={13} />}
              {acting === "approve" ? "Approving…" : "Approve & Schedule"}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={!!acting}
              className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/6 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-red-300/70 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
            >
              {acting === "reject" ? <RefreshCw size={13} className="animate-spin" /> : <XCircle size={13} />}
              {acting === "reject" ? "…" : "Reject"}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifStatus, setNotifStatus] = useState("unknown"); // "granted" | "denied" | "unknown"
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Subscribe to pending drafts in real-time
  useEffect(() => {
    const q = query(
      collection(db, "marketingDrafts"),
      where("status", "in", ["pending", "awaiting_image"]),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setDrafts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, (err) => {
      console.error("Drafts listener error:", err);
      setLoading(false);
    });

    return unsub;
  }, []);

  // Foreground notification toast
  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
      showToast(payload.notification?.body || "New draft ready", "info");
    });
    return unsub;
  }, []);

  // Check notification permission on mount
  useEffect(() => {
    if ("Notification" in window) {
      setNotifStatus(Notification.permission);
    }
  }, []);

  const enableNotifications = async () => {
    const token = await requestNotificationPermission();
    setNotifStatus(token ? "granted" : "denied");
    if (token) showToast("Push notifications enabled");
    else showToast("Notification permission denied", "error");
  };

  const handleApprove = useCallback(async (draftId, edits) => {
    await updateDoc(doc(db, "marketingDrafts", draftId), {
      status: "approved",
      captionEn: edits.captionEn,
      captionSinhala: edits.captionSinhala,
      updatedAt: serverTimestamp(),
    });
    showToast("Draft approved — the bot will post at the scheduled time");
  }, []);

  const handleReject = useCallback(async (draftId) => {
    await updateDoc(doc(db, "marketingDrafts", draftId), {
      status: "rejected",
      updatedAt: serverTimestamp(),
    });
    showToast("Draft rejected");
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-900 px-4 py-8 sm:px-6 lg:px-10">
      {/* header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-amber-300/60">FacetVault · Content</p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-white">
            Draft Approvals
          </h1>
          <p className="mt-1.5 text-sm text-white/36">
            Review and approve auto-generated posts before they go live.
          </p>
        </div>

        {/* notification toggle */}
        <button
          type="button"
          onClick={notifStatus !== "granted" ? enableNotifications : undefined}
          className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-[11px] uppercase tracking-[0.18em] transition ${
            notifStatus === "granted"
              ? "border-emerald-400/20 bg-emerald-400/8 text-emerald-300"
              : "border-white/10 bg-white/4 text-white/40 hover:border-amber-300/30 hover:text-amber-200"
          }`}
        >
          {notifStatus === "granted" ? <Bell size={12} /> : <BellOff size={12} />}
          {notifStatus === "granted" ? "Notifications on" : "Enable notifications"}
        </button>
      </div>

      {/* toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
              toast.type === "error"
                ? "border-red-400/20 bg-red-400/8 text-red-300"
                : toast.type === "info"
                ? "border-amber-300/20 bg-amber-300/8 text-amber-200"
                : "border-emerald-400/20 bg-emerald-400/8 text-emerald-300"
            }`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* content */}
      {loading && (
        <div className="flex h-48 items-center justify-center">
          <div className="h-7 w-7 rounded-full border-2 border-amber-300/30 border-t-amber-300 animate-spin" />
        </div>
      )}

      {!loading && drafts.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-white/6 bg-white/2 text-center">
          <div className="mb-3 text-3xl text-white/10">◇</div>
          <p className="text-[11px] uppercase tracking-[0.24em] text-white/24">No drafts pending</p>
          <p className="mt-1 text-xs text-white/18">The bot will notify you when a new draft is ready</p>
        </div>
      )}

      {!loading && drafts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {drafts.map((draft) => (
              <DraftCard
                key={draft.id}
                draft={draft}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
