import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection, query, where, orderBy, onSnapshot,
  doc, updateDoc, serverTimestamp,
} from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../../lib/firebase/config";
import { onForegroundMessage } from "../../lib/firebase/fcm";
import {
  CheckCircle, XCircle, RefreshCw,
  Edit3, Check, X, Clock, Upload, Shuffle, Undo2, Sparkles,
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
  feature:          "Feature Post",
  mystery:          "Mystery Post",
  origin:           "Informative Post",
  quiz:             "Gem Quiz",
  stone_to_jewelry: "Stone → Jewelry",
  birthstone:       "Birthstone Gift",
  astrology:        "Astrology",
  trust:            "Trust & Education",
  how_to_buy:       "How to Buy",
  faq:              "FAQ",
};

// Post types that use a stone image in 4/5 portrait ratio
const PORTRAIT_TYPES = new Set(["feature", "mystery", "stone_to_jewelry", "birthstone", "astrology"]);
// Post types that use a layout selector
const LAYOUT_SELECTOR_TYPES = new Set(["feature", "mystery", "stone_to_jewelry"]);

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

const BOT_URL = "https://facetvaultbot.onrender.com";

function DraftCard({ draft, onApprove, onReject }) {
  const [captionEn, setCaptionEn] = useState(draft.captionEn || "");
  const [acting, setActing] = useState(null);
  const [undoSecs, setUndoSecs] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [rebuildingImage, setRebuildingImage] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState(draft.currentLayout || "standard");
  const fileInputRef = useRef(null);
  const rejectTimerRef = useRef(null);
  const imageUrlAtRebuildRef = useRef(draft.brandedImageUrl);

  // Sync layout chip when Firestore pushes a new currentLayout
  useEffect(() => {
    setSelectedLayout(draft.currentLayout || "standard");
  }, [draft.currentLayout]);

  // Clear rebuilding spinner once a new branded image arrives via onSnapshot
  useEffect(() => {
    if (rebuildingImage && draft.brandedImageUrl !== imageUrlAtRebuildRef.current) {
      setRebuildingImage(false);
    }
  }, [draft.brandedImageUrl, rebuildingImage]);

  const handleApprove = async () => {
    setActing("approve");
    await onApprove(draft.id, { captionEn });
  };

  // Reject with 5-second undo window
  const startReject = () => {
    let secs = 5;
    setUndoSecs(secs);
    rejectTimerRef.current = setInterval(() => {
      secs -= 1;
      if (secs <= 0) {
        clearInterval(rejectTimerRef.current);
        setUndoSecs(null);
        setActing("reject");
        onReject(draft.id).catch(() => setActing(null));
      } else {
        setUndoSecs(secs);
      }
    }, 1000);
  };

  const handleUndoReject = () => {
    clearInterval(rejectTimerRef.current);
    setUndoSecs(null);
  };

  // Remove awaiting-image draft immediately (no undo needed — no content yet)
  const handleRemove = async () => {
    setActing("reject");
    await onReject(draft.id);
  };

  // Reject current draft and trigger the bot to generate a fresh one
  const handleReselect = async () => {
    setActing("reselect");
    await onReject(draft.id);
    fetch(`${BOT_URL}/trigger-draft`).catch(() => {});
  };

  // Use stone photo — trigger bot to build branded image
  const handleUseStone = async () => {
    imageUrlAtRebuildRef.current = draft.brandedImageUrl;
    setRebuildingImage(true);
    try {
      await fetch(`${BOT_URL}/rebuild-image?draftId=${draft.id}`);
    } catch (err) {
      console.error("Use stone failed:", err);
      setRebuildingImage(false);
    }
    setTimeout(() => setRebuildingImage(false), 35000);
  };

  // Upload a custom photo → store raw URL then trigger bot to build branded version
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const sRef = storageRef(storage, `marketingDrafts/${draft.id}/custom`);
      await uploadBytes(sRef, file);
      const url = await getDownloadURL(sRef);
      await updateDoc(doc(db, "marketingDrafts", draft.id), {
        originalImageUrl: url,
        updatedAt: serverTimestamp(),
      });
      imageUrlAtRebuildRef.current = draft.brandedImageUrl;
      setRebuildingImage(true);
      fetch(`${BOT_URL}/rebuild-image?draftId=${draft.id}`).catch(console.error);
      setTimeout(() => setRebuildingImage(false), 35000);
    } catch (err) {
      console.error("Image upload failed:", err);
      setRebuildingImage(false);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Friday quiz: Andrew picks a question, bot builds the image
  const handleSelectQuestion = async (idx) => {
    imageUrlAtRebuildRef.current = draft.brandedImageUrl;
    setRebuildingImage(true);
    try {
      await fetch(`${BOT_URL}/select-question?draftId=${draft.id}&questionIndex=${idx}`);
    } catch (err) {
      console.error("Question selection failed:", err);
      setRebuildingImage(false);
    }
    setTimeout(() => setRebuildingImage(false), 40000);
  };

  // Rebuild branded image with chosen layout (feature/mystery posts)
  const handleRebuildImage = async (layout) => {
    imageUrlAtRebuildRef.current = draft.brandedImageUrl;
    setRebuildingImage(true);
    setSelectedLayout(layout);
    try {
      await fetch(`${BOT_URL}/rebuild-image?draftId=${draft.id}&layout=${layout}`);
    } catch (err) {
      console.error("Rebuild failed:", err);
      setRebuildingImage(false);
      return;
    }
    setTimeout(() => setRebuildingImage(false), 35000);
  };

  const isOriginWaiting = draft.status === "awaiting_image";
  const isQuizWaiting = draft.postType === "quiz" && draft.status === "awaiting_question_selection";
  const isFeaturePost = LAYOUT_SELECTOR_TYPES.has(draft.postType);
  const imageAspect = PORTRAIT_TYPES.has(draft.postType) ? "aspect-[4/5]" : "aspect-square";

  return (
    <div className="overflow-hidden rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(4,10,22,0.97),rgba(2,6,18,0.99))] shadow-lux-elevated">
      {/* post image area */}
      {(() => {
        // Full-screen building spinner (when no image exists yet — e.g. quiz or first Use This Stone)
        if (rebuildingImage && !draft.brandedImageUrl && !draft.originalImageUrl) {
          return (
            <div className={`flex ${imageAspect} w-full flex-col items-center justify-center gap-2.5 bg-obsidian-900`}>
              <div className="h-8 w-8 rounded-full border-2 border-amber-300/30 border-t-amber-300 animate-spin" />
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/80">Building image…</p>
            </div>
          );
        }
        // Quiz waiting for question selection
        if (isQuizWaiting) {
          return (
            <div className={`flex ${imageAspect} w-full flex-col items-center justify-center gap-2 bg-obsidian-900`}>
              <div className="text-4xl text-amber-300/30">◆</div>
              <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/40">Gem Quiz</p>
              <p className="text-[10px] text-white/25 mt-0.5">Choose a question below</p>
            </div>
          );
        }
        // Image available
        if (draft.brandedImageUrl || draft.originalImageUrl) {
          return (
            <div className={`relative ${imageAspect} w-full overflow-hidden bg-obsidian-900`}>
              <img
                src={draft.brandedImageUrl || draft.originalImageUrl}
                alt={draft.altText || draft.stoneName}
                className="h-full w-full object-cover"
              />
              <div className="absolute left-3 top-3 rounded-full border border-white/14 bg-black/52 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur-sm">
                {POST_TYPE_LABELS[draft.postType] || draft.postType}
              </div>
              {rebuildingImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2.5 bg-black/65 backdrop-blur-sm">
                  <div className="h-8 w-8 rounded-full border-2 border-amber-300/30 border-t-amber-300 animate-spin" />
                  <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/80">Building image…</p>
                </div>
              )}
              {isOriginWaiting && !rebuildingImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-sm px-6">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300/80">Choose image below</p>
                  <button
                    type="button"
                    onClick={handleUseStone}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 rounded-2xl border border-emerald-400/40 bg-emerald-400/14 px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.16em] text-emerald-300 transition hover:bg-emerald-400/20 disabled:opacity-50"
                  >
                    <CheckCircle size={13} />
                    Use This Stone
                  </button>
                </div>
              )}
            </div>
          );
        }
        return (
          <div className={`flex ${imageAspect} w-full items-center justify-center bg-obsidian-800 text-4xl text-white/10`}>◇</div>
        );
      })()}

      {/* layout selector — feature/mystery posts only */}
      {isFeaturePost && !isOriginWaiting && (
        <div className="flex gap-1.5 px-5 pt-4">
          {[
            { key: "standard", label: "Standard" },
            { key: "tall", label: "Tall" },
            { key: "overlay", label: "Overlay" },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => handleRebuildImage(key)}
              disabled={rebuildingImage}
              className={`flex-1 rounded-xl border py-2 text-[9px] uppercase tracking-[0.15em] font-semibold transition disabled:opacity-50 ${
                selectedLayout === key
                  ? "border-amber-300/50 bg-amber-300/12 text-amber-200"
                  : "border-white/10 bg-white/4 text-white/36 hover:border-white/20 hover:text-white/60"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
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

        {/* quiz question selector */}
        {isQuizWaiting && !rebuildingImage && (
          <div className="space-y-2.5 border-t border-white/6 pt-4">
            <p className="text-[10px] uppercase tracking-[0.22em] text-amber-300/60 mb-3">Choose a question</p>
            {(draft.questionOptions || []).map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectQuestion(idx)}
                className="w-full rounded-2xl border border-white/10 bg-white/3 p-4 text-left text-[13px] leading-relaxed text-white/70 transition hover:border-amber-300/30 hover:bg-amber-300/5 hover:text-white/90 active:scale-[0.98]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* captions */}
        {!isOriginWaiting && !isQuizWaiting && (
          <div className="space-y-4 border-t border-white/6 pt-4">
            <EditableCaption
              label="Caption · English"
              value={captionEn}
              onChange={setCaptionEn}
            />
            {draft.hashtags && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/36 mb-1.5">Hashtags</p>
                <p className="text-[12px] text-sapphire-400/80 leading-relaxed">{draft.hashtags}</p>
              </div>
            )}
          </div>
        )}

        {/* awaiting-image actions */}
        {isOriginWaiting && (
          <div className="space-y-2 border-t border-white/6 pt-4">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage || rebuildingImage || !!acting}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/8 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-300/12 disabled:opacity-50"
            >
              {uploadingImage ? <RefreshCw size={13} className="animate-spin" /> : <Upload size={13} />}
              {uploadingImage ? "Uploading…" : "Upload a Different Photo"}
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleReselect}
                disabled={!!acting || uploadingImage || rebuildingImage}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 transition hover:border-white/20 hover:text-white/70 disabled:opacity-50"
              >
                {acting === "reselect" ? <RefreshCw size={12} className="animate-spin" /> : <Shuffle size={12} />}
                {acting === "reselect" ? "Selecting…" : "New Stone"}
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={!!acting || uploadingImage || rebuildingImage}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-red-300/60 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
              >
                {acting === "reject" ? <RefreshCw size={12} className="animate-spin" /> : <XCircle size={12} />}
                {acting === "reject" ? "Removing…" : "Remove"}
              </button>
            </div>
          </div>
        )}

        {/* pending: approve + reject with 5s undo */}
        {!isOriginWaiting && !isQuizWaiting && (
          <div className="space-y-2 pt-1">
            {undoSecs !== null ? (
              <div className="flex items-center justify-between rounded-2xl border border-amber-300/20 bg-amber-300/6 px-4 py-3">
                <p className="text-[12px] text-amber-200/80">Rejecting in {undoSecs}s…</p>
                <button
                  type="button"
                  onClick={handleUndoReject}
                  className="flex items-center gap-1.5 rounded-xl border border-amber-300/30 bg-amber-300/10 px-3 py-1.5 text-[11px] font-semibold text-amber-200 transition hover:bg-amber-300/18"
                >
                  <Undo2 size={11} /> Undo
                </button>
              </div>
            ) : (
              <div className="flex gap-3">
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
                  onClick={startReject}
                  disabled={!!acting}
                  className="flex items-center justify-center gap-2 rounded-2xl border border-red-400/20 bg-red-400/6 px-4 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-red-300/70 transition hover:border-red-400/40 hover:text-red-300 disabled:opacity-50"
                >
                  <XCircle size={13} />
                  Reject
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

const TRIGGERABLE_TYPES = [
  { value: "auto",           label: "Auto (today's type)" },
  { value: "feature",        label: "Feature Post" },
  { value: "mystery",        label: "Mystery Post" },
  { value: "stone_to_jewelry", label: "Stone → Jewelry" },
  { value: "birthstone",     label: "Birthstone Gift" },
  { value: "astrology",      label: "Astrology" },
  { value: "trust",          label: "Trust & Education" },
  { value: "origin",         label: "Informative / Origin" },
  { value: "quiz",           label: "Gem Quiz" },
];

export default function DraftsPage() {
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState("auto");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const endpoint = selectedType === "auto" || selectedType === "origin"
        ? selectedType === "origin" ? `${BOT_URL}/trigger-origin` : `${BOT_URL}/trigger-draft`
        : `${BOT_URL}/trigger-draft?postType=${selectedType}`;
      const res = await fetch(endpoint);
      const text = await res.text();
      if (text.toLowerCase().includes("already") || text.toLowerCase().includes("skip")) {
        showToast("A draft is already pending — approve or remove it first", "info");
      } else {
        showToast("Generating new draft — it will appear here in a moment", "info");
      }
    } catch {
      showToast("Could not reach the bot — check Render is running", "error");
    } finally {
      setTimeout(() => setGenerating(false), 3000);
    }
  };

  // Subscribe to pending drafts in real-time
  useEffect(() => {
    const q = query(
      collection(db, "marketingDrafts"),
      where("status", "in", ["pending", "awaiting_image", "awaiting_question_selection"]),
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

  // Foreground notification toast — reads from data field (data-only FCM messages)
  useEffect(() => {
    const unsub = onForegroundMessage((payload) => {
      const body = payload.data?.body || payload.notification?.body || "New draft ready";
      showToast(body, "info");
    });
    return unsub;
  }, []);

  const handleApprove = useCallback(async (draftId, edits) => {
    await updateDoc(doc(db, "marketingDrafts", draftId), {
      status: "approved",
      captionEn: edits.captionEn,
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
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.34em] text-amber-300/60">FacetVault · Content</p>
          <h1 className="mt-1 font-display text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Draft Approvals
          </h1>
          <p className="mt-1.5 text-sm text-white/36">
            Review and approve posts before they go live.
          </p>
        </div>

        {/* generate controls — stacks vertically on mobile */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:shrink-0">
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            disabled={generating}
            className="w-full rounded-xl border border-white/10 bg-obsidian-800 px-3 py-2.5 text-[11px] text-white/60 outline-none focus:border-amber-300/30 disabled:opacity-50 sm:w-auto"
          >
            {TRIGGERABLE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/8 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-300/40 hover:bg-amber-300/14 disabled:opacity-60 sm:w-auto"
          >
            {generating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {generating ? "Generating…" : "Generate"}
          </button>
        </div>
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
        <div className="flex flex-col items-center justify-center rounded-3xl border border-amber-300/20 bg-amber-300/5 text-center px-6 py-12">
          <div className="mb-3 text-4xl text-amber-300/40">◇</div>
          <p className="text-sm font-semibold text-white/70">No drafts pending</p>
          <p className="mt-2 text-xs text-white/40">The bot will notify you when a new post is ready.</p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="mt-5 flex items-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/8 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-200 transition hover:border-amber-300/40 disabled:opacity-60"
          >
            {generating ? <RefreshCw size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {generating ? "Generating…" : "Generate Now"}
          </button>
        </div>
      )}

      {!loading && drafts.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {drafts.map((draft) => (
            <DraftCard
              key={draft.id}
              draft={draft}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  );
}
