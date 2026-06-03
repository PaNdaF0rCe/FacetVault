import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  MessageCircle, Video, ShieldCheck, MapPin, Gem,
  ChevronDown, Star, ArrowRight, Flame
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { WHATSAPP_NUMBER } from "../config/appConfig";
import { getPublicSaleInventory } from "../lib/firebase/inventory-operations";
import { submitReview, getApprovedReviews } from "../lib/firebase/reviews";
import InventoryItemCard from "../components/InventoryItemCard";

const WA_GENERAL   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm looking for a natural gemstone. Can you help me choose?")}`;
const WA_JEWELRY   = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm interested in turning a gemstone into custom jewelry. Can you guide me?")}`;
const WA_BIRTHSTONE = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm looking for a natural stone for birthstone or astrology use. Can you help me choose?")}`;

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

/* ── small reusable atoms ── */

function TrustCheck({ text }) {
  return (
    <div className="flex items-center gap-2 text-[13.5px] text-slate-300">
      <ShieldCheck size={14} className="shrink-0 text-amber-300/80" />
      <span>{text}</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return <p className="lux-eyebrow">{children}</p>;
}

function BuyerCard({ eyebrow, title, text, waLink }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col rounded-[22px] border border-white/8 bg-white/[0.03] p-6"
    >
      <p className="text-[11px] uppercase tracking-[0.26em] text-amber-300/70">{eyebrow}</p>
      <h3 className="mt-2.5 text-[16px] font-semibold text-white">{title}</h3>
      <p className="mt-2.5 flex-1 fv-body-sm">{text}</p>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/8 px-4 py-3 text-[13.5px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/14"
      >
        <MessageCircle size={14} />
        Ask on WhatsApp
      </a>
    </motion.div>
  );
}

function TrustCard({ icon: Icon, title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-[22px] border border-white/8 bg-white/[0.025] p-5 fv-trust-card"
    >
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border border-amber-300/22 bg-amber-300/10">
        <Icon size={18} className="text-amber-300" />
      </div>
      <h3 className="text-[15px] font-semibold text-white">{title}</h3>
      <p className="mt-2 fv-body-sm">{text}</p>
    </motion.div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/28 bg-amber-300/10 text-[13px] font-semibold text-amber-300">
        {number}
      </div>
      <div className="pt-0.5">
        <h3 className="text-[15px] font-semibold text-white">{title}</h3>
        <p className="mt-1.5 fv-body-sm">{text}</p>
      </div>
    </motion.div>
  );
}

const FAQ_ITEMS = [
  {
    q: "Are the gemstones natural and untreated?",
    a: "All stones are natural gemstones sourced from Sri Lanka. Treatment details (heat, no-heat, etc.) are disclosed on each listing. FacetVault is partnered with LGL Gem Lab as our official certification partner — certificates are available for eligible stones on request.",
  },
  {
    q: "Can I see a real video before buying?",
    a: "Yes — just message on WhatsApp and we'll send a real video of the stone in natural light before you commit to anything.",
  },
  {
    q: "How does the stone-to-jewelry service work?",
    a: "After you choose a stone, message us on WhatsApp. We'll discuss pendant, ring, earring, or simple setting options with our partner jewelers and give you a quote. You confirm, they craft it, and we handle delivery.",
  },
  {
    q: "What payment methods do you accept?",
    a: "Bank transfer and cash on delivery (COD) are the primary options. Confirm your preferred method when you inquire — we'll accommodate where possible.",
  },
  {
    q: "What if the stone doesn't look like the photos?",
    a: "We recommend requesting a real video first. If anything isn't as described after you receive the stone, message us directly on WhatsApp and we'll work it out.",
  },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-white/8">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 py-5 text-left text-[15px] font-medium text-white/90 hover:text-white"
      >
        <span>{q}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-amber-300/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-5 fv-body-sm">{a}</p>
      )}
    </div>
  );
}

/* ── Seed reviews shown when Firestore has none yet ── */
const SEED_REVIEWS = [
  { id: "s1", rating: 5, text: "Asked for a video on WhatsApp and had it within the hour. The stone looked exactly as described — no surprises at all. Will definitely buy again.", name: "Priya M.", location: "Colombo", anonymous: false },
  { id: "s2", rating: 5, text: "Found a beautiful no-heat yellow sapphire at a fair price. Treatment and origin explained clearly. Very honest and transparent.", name: "Tharaka S.", location: "Kandy", anonymous: false },
  { id: "s3", rating: 5, text: "Bought a cat's eye for my husband's ring. He helped me pick the right stone within my budget and arranged the setting too. Excellent service.", name: "Dilini P.", location: "Galle", anonymous: false },
];

function StarDisplay({ rating, size = 13 }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          className={i < rating ? "fill-amber-300 text-amber-300" : "fill-white/10 text-white/10"}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col gap-4 rounded-[22px] border border-white/8 bg-white/[0.025] p-6"
    >
      <StarDisplay rating={review.rating} />
      <p className="flex-1 fv-body-sm italic">"{review.text}"</p>
      <div>
        <p className="text-[13.5px] font-semibold text-white">{review.name}</p>
        {review.location && (
          <p className="text-[12px] text-slate-500">{review.location}</p>
        )}
      </div>
    </motion.div>
  );
}

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < (hovered || value);
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            onMouseEnter={() => setHovered(i + 1)}
            onMouseLeave={() => setHovered(0)}
            className="transition-transform hover:scale-110 active:scale-95"
            aria-label={`Rate ${i + 1} star${i > 0 ? "s" : ""}`}
          >
            <Star
              size={28}
              className={filled
                ? "fill-amber-300 text-amber-300"
                : "fill-white/10 text-white/20 hover:fill-amber-300/40 hover:text-amber-300/60"}
            />
          </button>
        );
      })}
    </div>
  );
}

const REVIEW_CHAR_LIMIT = 400;

function ReviewForm({ onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError("Please choose a star rating."); return; }
    if (text.trim().length < 10) { setError("Please write at least 10 characters."); return; }
    setError("");
    setLoading(true);
    try {
      await submitReview({ rating, text, name, location, anonymous });
      setDone(true);
      onSubmitted?.();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[22px] border border-emerald-400/20 bg-emerald-400/8 px-6 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-400/15">
          <Star size={20} className="fill-emerald-300 text-emerald-300" />
        </div>
        <p className="text-[15px] font-semibold text-white">Thank you for your review!</p>
        <p className="fv-body-sm">It's now live on the site.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[22px] border border-white/10 bg-white/[0.025] p-6 sm:p-8">
      <p className="lux-eyebrow mb-4">Leave a review</p>

      {/* Star picker */}
      <div className="mb-5">
        <p className="mb-2 text-[12px] uppercase tracking-[0.18em] text-white/40">Your rating *</p>
        <StarPicker value={rating} onChange={setRating} />
      </div>

      {/* Review text */}
      <div className="mb-4">
        <p className="mb-1.5 text-[12px] uppercase tracking-[0.18em] text-white/40">Your review *</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, REVIEW_CHAR_LIMIT))}
          placeholder="What was your experience like?"
          rows={3}
          className="w-full resize-none rounded-2xl border border-white/8 bg-[#020617] px-4 py-3 text-[14px] text-white placeholder:text-white/25 outline-none transition focus:border-amber-300/30 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
        />
        <p className="mt-1 text-right text-[11px] text-white/25">{text.length}/{REVIEW_CHAR_LIMIT}</p>
      </div>

      {/* Anonymous toggle */}
      <label className="mb-4 flex cursor-pointer items-center gap-3">
        <div
          onClick={() => setAnonymous((v) => !v)}
          className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${anonymous ? "bg-amber-400" : "bg-white/15"}`}
        >
          <span className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ${anonymous ? "translate-x-4" : ""}`} />
        </div>
        <span className="text-[13px] text-white/60">Stay anonymous</span>
      </label>

      {/* Name + location (hidden when anonymous) */}
      {!anonymous && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[12px] uppercase tracking-[0.18em] text-white/40">Your name</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya M."
              className="w-full rounded-2xl border border-white/8 bg-[#020617] px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 outline-none transition focus:border-amber-300/30 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
            />
          </div>
          <div>
            <p className="mb-1.5 text-[12px] uppercase tracking-[0.18em] text-white/40">Location</p>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Colombo"
              className="w-full rounded-2xl border border-white/8 bg-[#020617] px-4 py-2.5 text-[14px] text-white placeholder:text-white/25 outline-none transition focus:border-amber-300/30 focus:shadow-[0_0_0_3px_rgba(251,191,36,0.06)]"
            />
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-[13px] text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="lux-button-primary w-full py-3.5 text-[14px] disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}

const CATEGORIES = [
  { label: "Blue Sapphires", sub: "Ceylon's finest", emoji: "🔵", filter: "Blue Sapphire" },
  { label: "Yellow Sapphires", sub: "Saturn, wealth, clarity", emoji: "🟡", filter: "Yellow Sapphire" },
  { label: "Cat's Eye", sub: "Chrysoberyl & cymophane", emoji: "🟢", filter: "Cat's Eye" },
  { label: "Rubies & Spinels", sub: "Rare collector pieces", emoji: "🔴", filter: "Ruby" },
];

/* ── ReviewsSection — live Firestore reviews + submission form ── */

function ReviewsSection() {
  const [reviews, setReviews] = useState(null); // null = loading
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getApprovedReviews(20);
      setReviews(data);
    } catch {
      setReviews([]); // fall back to seeds on error
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const displayed = reviews && reviews.length > 0 ? reviews : SEED_REVIEWS;

  // Average rating
  const avg = displayed.length
    ? (displayed.reduce((s, r) => s + r.rating, 0) / displayed.length).toFixed(1)
    : null;

  return (
    <section className="fv-section px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.05 }}
        variants={stagger}
        className="mx-auto max-w-6xl"
      >
        {/* header */}
        <motion.div variants={fadeUp} className="mb-8 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <SectionLabel>Customer reviews</SectionLabel>
            <h2 className="lux-display mt-3 text-[1.8rem] text-white sm:text-[2.4rem]">
              Real experiences, real stones.
            </h2>
            {avg && (
              <div className="mt-3 flex items-center gap-2">
                <StarDisplay rating={Math.round(Number(avg))} size={14} />
                <span className="text-[13px] text-white/55">
                  {avg} / 5 · {displayed.length} review{displayed.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="lux-button-secondary shrink-0 gap-2 text-[13px]"
          >
            <Star size={13} />
            {showForm ? "Hide form" : "Leave a review"}
          </button>
        </motion.div>

        {/* review form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8 max-w-xl"
          >
            <ReviewForm onSubmitted={() => { load(); setShowForm(false); }} />
          </motion.div>
        )}

        {/* review cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {reviews === null
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-48 animate-pulse rounded-[22px] bg-white/[0.025]" />
              ))
            : displayed.map((r) => <ReviewCard key={r.id} review={r} />)
          }
        </div>
      </motion.div>
    </section>
  );
}

/* ── main component ── */

function Home() {
  const { data: allItems } = useQuery({
    queryKey: ["inventory-featured"],
    queryFn: () => getPublicSaleInventory(),
    staleTime: 5 * 60 * 1000,
  });

  // Show up to 4 featured stones (prefer featured:true flag, else first 4 available)
  const featured = allItems
    ? [
        ...allItems.filter((s) => s.featured),
        ...allItems.filter((s) => !s.featured),
      ].slice(0, 4)
    : [];

  return (
    <>
      <Helmet>
        <title>FacetVault | Natural Sri Lankan Gemstones — Buy via WhatsApp</title>
        <meta name="description" content="Natural Ceylon gemstones sourced from Sri Lanka. See real videos before you buy. Inquire on WhatsApp. Stone-to-jewelry service available." />
        <link rel="canonical" href="https://facetvault.store/" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://facetvault.store/" />
        <meta property="og:title" content="FacetVault | Natural Sri Lankan Gemstones — Buy via WhatsApp" />
        <meta property="og:description" content="Natural Ceylon gemstones sourced from Sri Lanka. See real videos before you buy. Inquire on WhatsApp." />
        <meta property="og:image" content="https://facetvault.store/logo.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="FacetVault | Natural Sri Lankan Gemstones — Buy via WhatsApp" />
        <meta name="twitter:description" content="Natural Ceylon gemstones sourced from Sri Lanka. See real videos before you buy." />
        <meta name="twitter:image" content="https://facetvault.store/logo.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "FacetVault",
          "url": "https://facetvault.store",
          "description": "Natural Sri Lankan gemstones. Buy via WhatsApp.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://facetvault.store/collection",
            "query-input": "required name=search_term_string",
          },
        })}</script>
      </Helmet>

      <div className="flex flex-col pb-20 sm:pb-0">

        {/* ── HERO ── */}
        <section className="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pt-24">
          {/* ambient glow */}
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
            <div className="h-[320px] w-[700px] rounded-full bg-amber-400/7 blur-3xl" />
          </div>

          <motion.div initial="hidden" animate="show" variants={stagger} className="mx-auto max-w-6xl">
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">

              {/* left — text */}
              <div className="order-2 lg:order-1">
                <motion.p variants={fadeUp} className="lux-eyebrow">
                  FacetVault · Natural Gemstones · Sri Lanka
                </motion.p>

                <motion.h1
                  variants={fadeUp}
                  className="lux-display mt-5 text-[2.4rem] leading-[1.05] text-white sm:text-[3.4rem] lg:text-[4rem]"
                >
                  Natural gemstones.{" "}
                  <span className="lux-display-italic text-amber-200/95">
                    See them. Then decide.
                  </span>
                </motion.h1>

                <motion.div variants={fadeUp} className="mt-5 h-px w-14 bg-gradient-to-r from-transparent via-amber-300/50 to-transparent" />

                <motion.p variants={fadeUp} className="fv-body mt-5 max-w-lg">
                  Choose a natural Sri Lankan gemstone. Request a real video. Confirm through WhatsApp — then wear it, reserve it, or turn it into custom jewelry.
                </motion.p>

                <motion.div variants={fadeUp} className="mt-4 flex flex-col gap-2.5">
                  <TrustCheck text="Official LGL Gem Lab certification partner" />
                  <TrustCheck text="Real video of the stone before purchase" />
                  <TrustCheck text="Founder-direct WhatsApp support" />
                  <TrustCheck text="Sourced from Ratnapura, Sri Lanka" />
                </motion.div>

                <motion.div
                  variants={fadeUp}
                  className="mt-7 flex flex-col items-start gap-3 sm:flex-row"
                >
                  <Link to="/collection" className="lux-button-primary min-w-[190px]">
                    Browse Stones
                  </Link>
                  <a
                    href={WA_GENERAL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-w-[190px] items-center justify-center gap-2 rounded-xl border border-emerald-400/22 bg-emerald-400/10 px-6 py-3 text-[14px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/16 active:scale-[0.98]"
                  >
                    <MessageCircle size={15} />
                    Ask on WhatsApp
                  </a>
                </motion.div>
              </div>

              {/* right — decorative gem stack (shows featured images or placeholder) */}
              <motion.div
                variants={fadeUp}
                className="order-1 flex justify-center lg:order-2 lg:justify-end"
              >
                <div className="relative w-full max-w-[340px]">
                  {/* glow behind */}
                  <div className="absolute inset-0 -z-10 rounded-3xl bg-amber-400/8 blur-2xl" />
                  <div className="grid grid-cols-2 gap-3">
                    {featured.slice(0, 3).map((stone, i) =>
                      stone?.thumbnailUrl || stone?.imageUrl ? (
                        <div
                          key={stone.id}
                          className={`overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] ${i === 0 ? "col-span-2 aspect-[16/9]" : "aspect-square"}`}
                        >
                          <img
                            src={stone.thumbnailUrl || stone.imageUrl}
                            alt={stone.name || "Natural gemstone"}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      ) : null
                    )}
                    {/* placeholder tiles when no images yet */}
                    {featured.length === 0 && (
                      <>
                        <div className="col-span-2 flex aspect-[16/9] items-center justify-center rounded-2xl border border-white/8 bg-white/[0.03]">
                          <Gem size={40} className="text-amber-300/30" />
                        </div>
                        <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
                          <Gem size={24} className="text-amber-300/20" />
                        </div>
                        <div className="flex aspect-square items-center justify-center rounded-2xl border border-white/8 bg-white/[0.02]">
                          <Gem size={24} className="text-amber-300/20" />
                        </div>
                      </>
                    )}
                  </div>

                  {/* floating trust badge */}
                  <div className="absolute -bottom-4 -right-4 flex items-center gap-2 rounded-full border border-amber-300/22 bg-[rgba(5,8,16,0.88)] px-4 py-2.5 shadow-lg backdrop-blur-md">
                    <ShieldCheck size={13} className="text-amber-300" />
                    <span className="text-[11.5px] font-medium text-white/90">LGL Certified Partner</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── FEATURED STONES ── */}
        {featured.length > 0 && (
          <section className="fv-section fv-section-alt px-4 sm:px-6 lg:px-8">
            <motion.div
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={stagger}
              className="mx-auto max-w-6xl"
            >
              <motion.div variants={fadeUp} className="mb-8 flex items-end justify-between">
                <div>
                  <SectionLabel>Hand-picked</SectionLabel>
                  <h2 className="lux-display mt-3 text-[1.8rem] text-white sm:text-[2.4rem]">
                    Featured stones
                  </h2>
                </div>
                <Link
                  to="/collection"
                  className="flex items-center gap-1.5 text-[13px] text-amber-300/75 transition-colors hover:text-amber-300"
                >
                  View all <ArrowRight size={13} />
                </Link>
              </motion.div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {featured.map((stone) => (
                  <motion.div key={stone.id} variants={fadeUp}>
                    <InventoryItemCard item={stone} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ── BROWSE BY CATEGORY ── */}
        <section className="fv-section px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <SectionLabel>Browse by type</SectionLabel>
              <h2 className="lux-display mt-3 text-[1.8rem] text-white sm:text-[2.4rem]">
                What are you looking for?
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {CATEGORIES.map(({ label, sub, emoji, filter }) => (
                <motion.div key={label} variants={fadeUp}>
                  <Link
                    to={`/collection?type=${encodeURIComponent(filter)}`}
                    className="group flex flex-col gap-3 rounded-[22px] border border-white/8 bg-white/[0.025] p-5 transition-all hover:border-amber-300/25 hover:bg-white/[0.04]"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <p className="text-[15px] font-semibold text-white group-hover:text-amber-200">{label}</p>
                      <p className="mt-1 text-[12.5px] text-slate-500">{sub}</p>
                    </div>
                    <ArrowRight size={14} className="text-amber-300/40 transition-transform group-hover:translate-x-1 group-hover:text-amber-300/70" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── ABOUT / ORIGIN STORY ── */}
        <section className="fv-section fv-section-alt px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <div className="grid items-center gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
              {/* label column */}
              <motion.div variants={fadeUp}>
                <p className="lux-eyebrow-rule">Our Story</p>
                <p className="mt-3 text-[12px] uppercase tracking-[0.22em] text-white/35">
                  Ratnapura, Sri Lanka
                </p>
                <div className="mt-6 flex flex-col gap-3">
                  {["Natural, not synthetic", "Ethically sourced", "Transparent treatment disclosure"].map((t) => (
                    <div key={t} className="flex items-center gap-2.5">
                      <div className="h-1.5 w-1.5 rounded-full bg-amber-300/70" />
                      <span className="text-[13.5px] text-slate-400">{t}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* text column */}
              <motion.div variants={fadeUp}>
                <h2 className="lux-display text-[1.8rem] text-white sm:text-[2.2rem]">
                  Every stone is sourced by hand.
                </h2>
                <p className="fv-body mt-5">
                  FacetVault was built on one simple idea: gemstone buyers deserve to know exactly what they're getting before they commit. Every stone in our collection is personally selected from the gem markets of Ratnapura — Sri Lanka's gem capital — and from trusted local dealers with decades of experience.
                </p>
                <p className="fv-body mt-4">
                  Sri Lanka has been producing world-class sapphires, spinels, and cat's eye chrysoberyls for centuries. When you buy from FacetVault, you're buying direct from the source — with treatment disclosure, certification access through our LGL Gem Lab partnership, and a real human on the other end of WhatsApp.
                </p>
                <a
                  href={WA_GENERAL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 text-[14px] text-amber-300/80 transition-colors hover:text-amber-300"
                >
                  Talk to the founder on WhatsApp
                  <ArrowRight size={14} />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── WHO IS THIS FOR ── */}
        <section className="fv-section px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <SectionLabel>Find the right stone</SectionLabel>
              <h2 className="lux-display mt-3 text-[1.8rem] text-white sm:text-[2.4rem]">
                Who shops at FacetVault?
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-3">
              <BuyerCard
                eyebrow="Astrology & Birthstones"
                title="A stone with meaning"
                text="Looking for a natural blue sapphire, yellow sapphire, cat's eye, or other planetary stone? We'll help you find the right one for your purpose."
                waLink={WA_BIRTHSTONE}
              />
              <BuyerCard
                eyebrow="Gifts"
                title="A meaningful gift"
                text="Natural gemstones make thoughtful gifts for engagements, anniversaries, or special occasions. We'll guide you to something within your budget."
                waLink={WA_GENERAL}
              />
              <BuyerCard
                eyebrow="Custom Jewelry"
                title="A stone to set"
                text="Find a stone you love, then work with our partner jewelers to turn it into a ring, pendant, or earring at an additional cost."
                waLink={WA_JEWELRY}
              />
            </div>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="fv-section fv-section-alt px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-10 text-center">
              <SectionLabel>Simple Process</SectionLabel>
              <h2 className="lux-display mt-3 text-[1.8rem] text-white sm:text-[2.6rem]">
                How buying works
              </h2>
              <p className="mx-auto mt-3 max-w-lg fv-body-sm">
                No checkout forms. No payment before you're confident. Find a stone, ask, and we'll take it from there.
              </p>
            </motion.div>

            <div className="fv-steps mx-auto max-w-2xl space-y-8">
              <StepCard number="1" title="Browse the collection" text="Explore available stones on mobile or desktop. Filter by type, price, or category." />
              <StepCard number="2" title="Request a real video" text="Message on WhatsApp with the stone name or code. We'll send a short video of the actual stone in natural light — before anything is decided." />
              <StepCard number="3" title="Reserve or inquire" text="If you like it, reserve it via WhatsApp. Discuss price, payment (bank transfer or COD), and delivery directly." />
              <StepCard number="4" title="Wear it or turn it into jewelry" text="Keep the stone as-is, or ask about custom jewelry settings through our partner jewelers." />
            </div>

            <motion.div variants={fadeUp} className="mt-10 text-center">
              <a
                href={WA_GENERAL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/22 bg-emerald-400/10 px-6 py-3 text-[14px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/16"
              >
                <MessageCircle size={15} />
                Start a conversation on WhatsApp
              </a>
            </motion.div>
          </motion.div>
        </section>

        {/* ── STONE TO JEWELRY ── */}
        <section className="fv-section px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={fadeUp}
            className="mx-auto max-w-6xl rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,18,32,0.72),rgba(6,11,22,0.9))] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-10 lg:p-12"
          >
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <p className="lux-eyebrow-rule">Stone to Jewelry</p>
                <h2 className="lux-display mt-5 text-[1.9rem] text-white sm:text-[2.4rem]">
                  Turn your stone into something you can wear.
                </h2>
                <p className="fv-body mt-4">
                  After purchasing a gemstone from FacetVault, you can work with our partner jewelers to have it set into a ring, pendant, earring, or simple bezel setting.
                </p>
                <p className="fv-body-sm mt-3">
                  The jewelry cost is separate and discussed directly — no surprises. We handle the coordination so you don't have to find a jeweler yourself.
                </p>
                <a
                  href={WA_JEWELRY}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-400/22 bg-emerald-400/10 px-6 py-3 text-[14px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/16"
                >
                  <MessageCircle size={15} />
                  Ask about custom jewelry
                </a>
              </div>

              <motion.div variants={stagger} className="grid gap-4 self-start">
                {[
                  ["Choose a gemstone", "Browse the collection and find a stone you love."],
                  ["Message us on WhatsApp", "Tell us you want it set into jewelry — we'll discuss style and budget."],
                  ["Confirm the design", "Pendant, ring, earring, or simple setting — we get a quote from the jeweler."],
                  ["We handle the rest", "The jeweler crafts the piece. We coordinate delivery or pickup."],
                ].map(([title, text], i) => (
                  <div
                    key={i}
                    className="flex gap-4 rounded-[18px] border border-white/6 bg-white/[0.03] p-4"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/24 bg-amber-300/10 text-[12px] font-semibold text-amber-300">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[14px] font-semibold text-white">{title}</p>
                      <p className="mt-1 fv-body-sm">{text}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── TRUST ── */}
        <section className="fv-section fv-section-alt px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-10 text-center">
              <SectionLabel>Why trust FacetVault</SectionLabel>
              <h2 className="lux-display mt-3 text-[1.8rem] text-white sm:text-[2.4rem]">
                Buying a gemstone should feel safe.
              </h2>
            </motion.div>

            <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <TrustCard icon={Video}        title="Real videos on request"        text="Message us and we'll send a short video of the actual stone before you decide anything." />
              <TrustCard icon={MapPin}       title="Sourced from Sri Lanka"         text="All stones come from Sri Lanka — purchased directly from Ratnapura gem markets and trusted local dealers." />
              <TrustCard icon={ShieldCheck}  title="Official LGL Gem Lab partner"   text="FacetVault is partnered with LGL Gem Lab as our official gem certification partner. Ask when you inquire." />
              <TrustCard icon={MessageCircle} title="Founder-led support"           text="You're talking directly to the founder on WhatsApp — not a bot, not a call centre." />
              <TrustCard icon={Gem}          title="No-pressure buying"             text="Request a video, ask questions, and take your time. There's no cart, no checkout pressure." />
              <TrustCard icon={ShieldCheck}  title="Treatment disclosed"            text="Heat treatment status is listed on each stone where known. We don't hide it." />
            </div>
          </motion.div>
        </section>

        {/* ── REVIEWS ── */}
        <ReviewsSection />

        {/* ── EDUCATIONAL CONTENT ── */}
        <section className="fv-section fv-section-alt px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <SectionLabel>Learn about gemstones</SectionLabel>
              <h2 className="lux-display mt-3 text-[1.7rem] text-white sm:text-[2.2rem]">
                Make a confident decision.
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  emoji: "🔬",
                  title: 'What does "No Heat" mean?',
                  text: "Unheated stones are rarer and command a premium. Learn why heat treatment is common, when it matters, and how to verify it.",
                  link: "/collection?treatment=no-heat",
                },
                {
                  emoji: "⚖️",
                  title: "Carat weight vs stone size",
                  text: "A 2ct sapphire and a 2ct ruby can look very different in size. Understand density, cut, and what to actually look for.",
                  link: "/collection",
                },
                {
                  emoji: "🇱🇰",
                  title: "Why Ceylon gemstones?",
                  text: "Sri Lanka has produced world-class sapphires for over 2,000 years. Understand what makes Ceylon stones distinctive and highly valued.",
                  link: "/collection",
                },
              ].map(({ emoji, title, text, link }) => (
                <motion.div key={title} variants={fadeUp}>
                  <Link
                    to={link}
                    className="group flex flex-col gap-4 rounded-[22px] border border-white/8 bg-white/[0.025] p-6 transition-all hover:border-amber-300/22 hover:bg-white/[0.04]"
                  >
                    <span className="text-2xl">{emoji}</span>
                    <div>
                      <h3 className="text-[15px] font-semibold text-white group-hover:text-amber-200">{title}</h3>
                      <p className="mt-2 fv-body-sm">{text}</p>
                    </div>
                    <span className="flex items-center gap-1.5 text-[12.5px] text-amber-300/60 transition-colors group-hover:text-amber-300/90">
                      Explore collection <ArrowRight size={12} />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* ── FAQ ── */}
        <section className="fv-section px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-2xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <SectionLabel>Common questions</SectionLabel>
              <h2 className="lux-display mt-3 text-[1.8rem] text-white sm:text-[2.2rem]">
                FAQ
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-[26px] border border-white/8 bg-white/[0.025] px-6 py-1">
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="fv-section px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.25 }}
            variants={fadeUp}
            className="relative mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-white/8 bg-[rgba(10,18,32,0.68)] p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-12"
          >
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-0 h-[240px] w-[500px] -translate-x-1/2 rounded-full bg-amber-400/8 blur-3xl" />
            </div>

            <SectionLabel>Ready to start?</SectionLabel>
            <h2 className="lux-display mt-5 text-[1.85rem] text-white sm:text-[2.8rem]">
              Browse the collection or ask us anything.
            </h2>
            <p className="mx-auto mt-4 max-w-xl fv-body">
              No commitment required. Browse stones, request a real video, and buy only when you're confident.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/collection" className="lux-button-primary min-w-[200px]">
                Browse Stones
              </Link>
              <a
                href={WA_GENERAL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl border border-emerald-400/22 bg-emerald-400/10 px-6 py-3 text-[14px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/16 active:scale-[0.98]"
              >
                <MessageCircle size={15} />
                Ask on WhatsApp
              </a>
            </div>
          </motion.div>
        </section>

      </div>

      {/* ── STICKY MOBILE BOTTOM BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex gap-2 border-t border-white/8 bg-[rgba(5,8,16,0.94)] p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-lg sm:hidden">
        <Link
          to="/collection"
          className="lux-button-primary flex-1 py-3.5 text-[14px]"
        >
          Browse Stones
        </Link>
        <a
          href={WA_GENERAL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#25D366] py-3.5 text-[14px] font-semibold text-white shadow-[0_2px_12px_rgba(37,211,102,0.28)] transition-[transform,opacity] duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          <MessageCircle size={15} strokeWidth={2} />
          WhatsApp
        </a>
      </div>
    </>
  );
}

export default Home;
