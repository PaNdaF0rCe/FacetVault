import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Copy,
  Star,
  RefreshCw,
  Save,
  CheckCircle,
  ChevronDown,
  Layers,
  Zap,
  Globe,
  Image as ImageIcon,
  Video,
  FileText,
  Hash,
} from "lucide-react";
import { generateGemstoneContent, generateCaptionVariations } from "../../providers/openai";
import { saveGeneratedContent, getGeneratedContent, updateContentStatus, toggleFavorite } from "../../lib/firebase/content-operations";
import { PROMPT_TEMPLATES, GEMSTONES, CONTENT_TYPES, PLATFORMS, STYLES, PROVIDER_MAP } from "../../lib/ai/templates";

// ── tiny helpers ──────────────────────────────────────────────────────────────

function copyText(text) {
  navigator.clipboard.writeText(text).catch(() => {});
}

function Pill({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.18em] transition-all duration-200 ${
        active
          ? "border-amber-300/60 bg-amber-300/12 text-amber-200 shadow-[0_0_0_1px_rgba(251,191,36,0.18)]"
          : "border-white/10 bg-white/4 text-white/40 hover:border-white/20 hover:text-white/70"
      }`}
    >
      {children}
    </button>
  );
}

function CopyBtn({ value, label = "Copy" }) {
  const [copied, setCopied] = useState(false);
  const handle = () => {
    copyText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <button
      type="button"
      onClick={handle}
      className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/50 transition hover:border-amber-300/30 hover:text-amber-200"
    >
      {copied ? <CheckCircle size={12} className="text-emerald-400" /> : <Copy size={12} />}
      {copied ? "Copied" : label}
    </button>
  );
}

function SectionCard({ icon: Icon, title, value, mono = false, children }) {
  if (!value && !children) return null;
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/36">
          <Icon size={12} className="text-amber-300/60" />
          {title}
        </div>
        {value && <CopyBtn value={value} />}
      </div>
      {value && (
        <p className={`text-sm leading-relaxed text-white/80 ${mono ? "font-mono text-[12px]" : ""}`}>{value}</p>
      )}
      {children}
    </div>
  );
}

function SelectRow({ label, options, value, onChange }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/36">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <Pill key={o} active={value === o} onClick={() => onChange(o)}>
            {o}
          </Pill>
        ))}
      </div>
    </div>
  );
}

// ── history item ──────────────────────────────────────────────────────────────

function HistoryCard({ item, onMarkPosted, onToggleFav }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-2xl border border-white/8 bg-white/3 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] uppercase tracking-[0.2em] text-amber-300/70">{item.gemstoneType}</span>
          <span className="text-[10px] text-white/30">·</span>
          <span className="text-[10px] text-white/40">{item.platform}</span>
          <span className="text-[10px] text-white/30">·</span>
          <span className="text-[10px] text-white/40">{item.contentType}</span>
          {item.isFavorite && <Star size={10} className="text-amber-300 fill-amber-300" />}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] uppercase tracking-[0.16em] rounded-full border px-2 py-0.5 ${
              item.status === "posted"
                ? "border-emerald-400/30 text-emerald-300 bg-emerald-400/10"
                : item.status === "saved"
                ? "border-amber-300/30 text-amber-200 bg-amber-300/10"
                : "border-white/12 text-white/30 bg-white/4"
            }`}
          >
            {item.status}
          </span>
          <ChevronDown
            size={14}
            className={`text-white/30 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/6 px-4 pb-4 pt-3 space-y-3">
              {item.imagePrompt && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Image Prompt</p>
                    <CopyBtn value={item.imagePrompt} />
                  </div>
                  <p className="text-[12px] text-white/60 font-mono leading-relaxed">{item.imagePrompt}</p>
                </div>
              )}
              {item.caption && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[10px] uppercase tracking-widest text-white/30">Caption</p>
                    <CopyBtn value={item.caption} />
                  </div>
                  <p className="text-[13px] text-white/75 leading-relaxed">{item.caption}</p>
                </div>
              )}
              {item.hashtags && (
                <p className="text-[11px] text-sapphire-400 leading-relaxed">{item.hashtags}</p>
              )}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onToggleFav(item.id, item.isFavorite)}
                  className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/50 hover:border-amber-300/30 hover:text-amber-200 transition"
                >
                  <Star size={11} className={item.isFavorite ? "text-amber-300 fill-amber-300" : ""} />
                  {item.isFavorite ? "Unfavourite" : "Favourite"}
                </button>
                {item.status !== "posted" && (
                  <button
                    type="button"
                    onClick={() => onMarkPosted(item.id)}
                    className="flex items-center gap-1.5 rounded-lg border border-emerald-400/20 bg-emerald-400/8 px-3 py-1.5 text-[11px] text-emerald-300 hover:border-emerald-400/40 transition"
                  >
                    <CheckCircle size={11} />
                    Mark Posted
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── main page ─────────────────────────────────────────────────────────────────

export default function ContentGeneratorPage() {
  const [gemstone, setGemstone] = useState("Sapphire");
  const [contentType, setContentType] = useState("Image");
  const [platform, setPlatform] = useState("Instagram");
  const [style, setStyle] = useState("Luxury");
  const [template, setTemplate] = useState(PROMPT_TEMPLATES[0]);
  const [providerTarget, setProviderTarget] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedId, setSavedId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [captionVars, setCaptionVars] = useState([]);
  const [loadingVars, setLoadingVars] = useState(false);

  const [history, setHistory] = useState([]);
  const [historyTab, setHistoryTab] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const providers = PROVIDER_MAP[contentType] || [];

  const handleGenerate = useCallback(async () => {
    setLoading(true);
    setError("");
    setResult(null);
    setSavedId(null);
    setCaptionVars([]);

    try {
      const data = await generateGemstoneContent({ gemstone, contentType, platform, style, template: template.name });
      setResult(data);
    } catch (err) {
      setError(err?.message || "Generation failed. Check your OpenAI key.");
    } finally {
      setLoading(false);
    }
  }, [gemstone, contentType, platform, style, template]);

  const handleSave = async () => {
    if (!result) return;
    setSaving(true);
    try {
      const id = await saveGeneratedContent({
        gemstoneType: gemstone,
        contentType,
        platform,
        style,
        template: template.name,
        providerTarget,
        ...result,
      });
      setSavedId(id);
    } catch (err) {
      setError("Save failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleGetVariations = async () => {
    if (!result?.caption) return;
    setLoadingVars(true);
    try {
      const vars = await generateCaptionVariations({ caption: result.caption, platform, gemstone });
      setCaptionVars(vars);
    } finally {
      setLoadingVars(false);
    }
  };

  const loadHistory = async () => {
    setLoadingHistory(true);
    try {
      const items = await getGeneratedContent({ limitCount: 30 });
      setHistory(items);
      setHistoryTab(true);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleMarkPosted = async (id) => {
    await updateContentStatus(id, "posted");
    setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, status: "posted" } : h)));
  };

  const handleToggleFav = async (id, current) => {
    await toggleFavorite(id, current);
    setHistory((prev) => prev.map((h) => (h.id === id ? { ...h, isFavorite: !current } : h)));
  };

  const applyTemplate = (t) => {
    setTemplate(t);
    if (t.gemstone !== "Mixed") setGemstone(t.gemstone);
    setStyle(t.style);
    setContentType(t.contentType);
  };

  return (
    <div className="min-h-screen bg-obsidian-900 px-4 py-8 sm:px-6 lg:px-10">
      {/* header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.34em] text-amber-300/60">FacetVault · Content Studio</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
          AI Content Generator
        </h1>
        <p className="mt-1.5 text-sm text-white/36">
          One cinematic gemstone piece per day — prompts, captions, hashtags.
        </p>
      </div>

      {/* tab bar */}
      <div className="mb-6 flex gap-3">
        <button
          type="button"
          onClick={() => setHistoryTab(false)}
          className={`rounded-xl border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
            !historyTab
              ? "border-amber-300/30 bg-amber-300/8 text-amber-200"
              : "border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          Generate
        </button>
        <button
          type="button"
          onClick={loadHistory}
          className={`rounded-xl border px-4 py-2 text-[11px] uppercase tracking-[0.2em] transition ${
            historyTab
              ? "border-amber-300/30 bg-amber-300/8 text-amber-200"
              : "border-white/10 text-white/40 hover:text-white/70"
          }`}
        >
          {loadingHistory ? "Loading…" : "History"}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* ── HISTORY TAB ── */}
        {historyTab ? (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-3 max-w-3xl"
          >
            {history.length === 0 && (
              <p className="text-sm text-white/30">No saved content yet. Generate and save your first piece.</p>
            )}
            {history.map((item) => (
              <HistoryCard
                key={item.id}
                item={item}
                onMarkPosted={handleMarkPosted}
                onToggleFav={handleToggleFav}
              />
            ))}
          </motion.div>
        ) : (
          /* ── GENERATOR TAB ── */
          <motion.div
            key="generate"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="grid gap-6 lg:grid-cols-[1fr_1.4fr]"
          >
            {/* ── LEFT: controls ── */}
            <div className="space-y-5">
              {/* templates */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5">
                <div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/36">
                  <Layers size={12} className="text-amber-300/60" />
                  Templates
                </div>
                <div className="space-y-2">
                  {PROMPT_TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => applyTemplate(t)}
                      className={`w-full rounded-xl border px-3.5 py-2.5 text-left transition ${
                        template.id === t.id
                          ? "border-amber-300/30 bg-amber-300/8"
                          : "border-white/6 bg-white/2 hover:border-white/14"
                      }`}
                    >
                      <p className={`text-[12px] font-medium ${template.id === t.id ? "text-amber-200" : "text-white/70"}`}>
                        {t.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-white/30">{t.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* selectors */}
              <div className="rounded-2xl border border-white/8 bg-white/3 p-5 space-y-5">
                <SelectRow label="Gemstone" options={GEMSTONES} value={gemstone} onChange={setGemstone} />
                <SelectRow label="Content Type" options={CONTENT_TYPES} value={contentType} onChange={setContentType} />
                <SelectRow label="Platform" options={PLATFORMS} value={platform} onChange={setPlatform} />
                <SelectRow label="Style" options={STYLES} value={style} onChange={setStyle} />

                {providers.length > 0 && (
                  <div>
                    <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-white/36">Target Provider</p>
                    <div className="flex flex-wrap gap-2">
                      {providers.map((p) => (
                        <Pill key={p.id} active={providerTarget === p.id} onClick={() => setProviderTarget(p.id)}>
                          {p.icon} {p.label}
                        </Pill>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* generate button */}
              <motion.button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: 0.985 }}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 py-4 text-[13px] font-semibold uppercase tracking-[0.22em] text-obsidian-900 shadow-lux-glow transition disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <RefreshCw size={14} className="animate-spin" />
                    Generating…
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Sparkles size={14} />
                    Generate Content
                  </span>
                )}
              </motion.button>

              {error && (
                <p className="rounded-xl border border-red-400/20 bg-red-400/8 px-4 py-3 text-[12px] text-red-300">
                  {error}
                </p>
              )}
            </div>

            {/* ── RIGHT: output ── */}
            <div className="space-y-4">
              {!result && !loading && (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-white/6 bg-white/2 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-amber-300/16 bg-amber-300/6 text-xl text-amber-300">
                    ◇
                  </div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-white/24">
                    Select options and generate
                  </p>
                </div>
              )}

              {loading && (
                <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-amber-300/12 bg-amber-300/4">
                  <div className="h-8 w-8 rounded-full border-2 border-amber-300/30 border-t-amber-300 animate-spin mb-4" />
                  <p className="text-[11px] uppercase tracking-[0.22em] text-amber-300/60">Crafting content…</p>
                </div>
              )}

              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* save bar */}
                  <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Zap size={13} className="text-amber-300" />
                      <span className="text-[12px] text-white/60">{gemstone} · {style} · {platform}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/50 hover:border-white/20 hover:text-white/80 transition"
                      >
                        <RefreshCw size={11} />
                        Regenerate
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={saving || !!savedId}
                        className="flex items-center gap-1.5 rounded-lg border border-amber-300/30 bg-amber-300/8 px-3 py-1.5 text-[11px] text-amber-200 hover:border-amber-300/50 transition disabled:opacity-50"
                      >
                        {savedId ? <CheckCircle size={11} className="text-emerald-400" /> : <Save size={11} />}
                        {savedId ? "Saved" : saving ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>

                  {/* image prompt */}
                  {result.imagePrompt && (
                    <SectionCard icon={ImageIcon} title="Image Prompt (Leonardo / Midjourney)" value={result.imagePrompt} mono />
                  )}

                  {/* video prompt */}
                  {result.videoPrompt && (
                    <SectionCard icon={Video} title="Video Prompt (Kling / Luma / Pika)" value={result.videoPrompt} mono />
                  )}

                  {/* product description */}
                  {result.productDescription && (
                    <SectionCard icon={FileText} title="Product Description" value={result.productDescription} />
                  )}

                  {/* caption */}
                  {result.caption && (
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="text-[10px] uppercase tracking-[0.22em] text-white/36">Caption · English</p>
                        <div className="flex gap-2">
                          <CopyBtn value={result.caption} />
                          <button
                            type="button"
                            onClick={handleGetVariations}
                            disabled={loadingVars}
                            className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-[11px] text-white/50 hover:border-amber-300/30 hover:text-amber-200 transition disabled:opacity-50"
                          >
                            <Sparkles size={11} />
                            {loadingVars ? "…" : "Variations"}
                          </button>
                        </div>
                      </div>
                      <p className="text-sm leading-relaxed text-white/80">{result.caption}</p>

                      {captionVars.length > 0 && (
                        <div className="mt-3 space-y-2 border-t border-white/6 pt-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-white/26 mb-2">Variations</p>
                          {captionVars.map((v, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-xl border border-white/6 bg-white/2 p-3">
                              <span className="mt-0.5 text-[10px] text-amber-300/50 font-mono">{i + 1}</span>
                              <p className="flex-1 text-[12px] leading-relaxed text-white/65">{v}</p>
                              <CopyBtn value={v} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* sinhala caption */}
                  {result.captionSinhala && (
                    <SectionCard icon={Globe} title="Caption · සිංහල" value={result.captionSinhala} />
                  )}

                  {/* hashtags */}
                  {result.hashtags && (
                    <div className="rounded-2xl border border-white/8 bg-white/3 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-white/36">
                          <Hash size={12} className="text-amber-300/60" />
                          Hashtags
                        </div>
                        <CopyBtn value={result.hashtags} />
                      </div>
                      <p className="text-[12px] leading-relaxed text-sapphire-400/80">{result.hashtags}</p>
                    </div>
                  )}

                  {/* CTA */}
                  {result.cta && (
                    <div className="rounded-2xl border border-amber-300/14 bg-amber-300/5 p-4 flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-amber-200">{result.cta}</p>
                      <CopyBtn value={result.cta} label="Copy CTA" />
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
