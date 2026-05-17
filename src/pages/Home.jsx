import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import { MessageCircle, Video, ShieldCheck, MapPin, Gem, ChevronDown } from "lucide-react";
import { useState } from "react";
import { WHATSAPP_NUMBER } from "../config/appConfig";

const WA_GENERAL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm looking for a natural gemstone. Can you help me choose?")}`;
const WA_JEWELRY = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm interested in turning a gemstone into custom jewelry. Can you guide me?")}`;
const WA_BIRTHSTONE = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm looking for a natural stone for birthstone or astrology use. Can you help me choose?")}`;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
};
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

function TrustPill({ icon: Icon, text }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.04] px-4 py-2 text-[12px] text-white/70 backdrop-blur-md"
    >
      <Icon size={13} className="text-amber-300/80 shrink-0" />
      <span>{text}</span>
    </motion.div>
  );
}

function StepCard({ number, title, text }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-amber-300/24 bg-amber-300/8 text-[13px] font-semibold text-amber-300">
        {number}
      </div>
      <div>
        <h3 className="text-[14px] font-semibold text-white">{title}</h3>
        <p className="mt-1 text-[13px] leading-relaxed text-slate-400">{text}</p>
      </div>
    </motion.div>
  );
}

function BuyerCard({ eyebrow, title, text, waLink }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col rounded-[22px] border border-white/8 bg-white/[0.03] p-5"
    >
      <p className="text-[10px] uppercase tracking-[0.26em] text-amber-300/68">{eyebrow}</p>
      <h3 className="mt-2 text-[15px] font-semibold text-white">{title}</h3>
      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-slate-400">{text}</p>
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-emerald-400/18 bg-emerald-400/8 px-4 py-2.5 text-[13px] font-medium text-emerald-300 transition-colors hover:bg-emerald-400/14"
      >
        <MessageCircle size={14} />
        Ask on WhatsApp
      </a>
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
        className="flex w-full items-center justify-between gap-4 py-4 text-left text-[14px] font-medium text-white/90 hover:text-white"
      >
        <span>{q}</span>
        <ChevronDown
          size={15}
          className={`shrink-0 text-amber-300/60 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <p className="pb-4 text-[13px] leading-relaxed text-slate-400">{a}</p>
      )}
    </div>
  );
}

function Home() {
  return (
    <>
      <Helmet>
        <title>FacetVault | Natural Sri Lankan Gemstones — Buy via WhatsApp</title>
        <meta
          name="description"
          content="Natural Ceylon gemstones sourced from Sri Lanka. See real videos before you buy. Inquire on WhatsApp. Stone-to-jewelry service available."
        />
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
          "description": "Natural Sri Lankan gemstones sourced from Sri Lanka. Buy via WhatsApp.",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://facetvault.store/collection",
            "query-input": "required name=search_term_string",
          },
        })}</script>
      </Helmet>

      <div className="flex flex-col">

        {/* ── HERO ── */}
        <section className="relative px-4 pb-16 pt-14 sm:px-6 sm:pb-20 sm:pt-18 lg:px-8 lg:pt-22">
          <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
            <div className="h-[280px] w-[680px] rounded-full bg-amber-400/6 blur-3xl" />
          </div>

          <motion.div
            initial="hidden"
            animate="show"
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <div className="mx-auto max-w-4xl text-center">
              <motion.p variants={fadeUp} className="lux-eyebrow">
                FacetVault — Natural Gemstones from Sri Lanka
              </motion.p>

              <motion.h1
                variants={fadeUp}
                className="lux-display mx-auto mt-6 max-w-4xl text-[1.9rem] text-white sm:text-[3.6rem] lg:text-[4.8rem]"
              >
                Natural gemstones.
                <br className="hidden sm:block" />{" "}
                <span className="lux-display-italic text-amber-200/95">
                  See them. Then decide.
                </span>
              </motion.h1>

              <motion.div
                variants={fadeUp}
                className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-amber-300/55 to-transparent"
              />

              <motion.p
                variants={fadeUp}
                className="mx-auto mt-6 max-w-xl text-[15px] leading-relaxed text-slate-300"
              >
                Choose a natural Sri Lankan gemstone. Request a real video. Confirm through WhatsApp — then wear it, reserve it, or turn it into custom jewelry.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
              >
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
              </motion.div>
            </div>

            {/* Trust pills */}
            <motion.div
              variants={stagger}
              className="mx-auto mt-10 flex flex-wrap justify-center gap-2"
            >
              <TrustPill icon={Video} text="Real videos before purchase" />
              <TrustPill icon={ShieldCheck} text="Official LGL Gem Lab partner" />
              <TrustPill icon={MapPin} text="Sourced from Sri Lanka" />
              <TrustPill icon={MessageCircle} text="WhatsApp support from the founder" />
              <TrustPill icon={Gem} text="Stone-to-jewelry service" />
            </motion.div>
          </motion.div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <p className="lux-eyebrow">Simple Process</p>
              <h2 className="lux-display mt-4 text-[1.9rem] text-white sm:text-[2.6rem]">
                How buying works
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-slate-400">
                No checkout forms. No payment before you're confident. Just find a stone, ask, and we'll take it from there.
              </p>
            </motion.div>

            <div className="mx-auto max-w-2xl space-y-7">
              <StepCard
                number="1"
                title="Browse the collection"
                text="Explore available stones on mobile or desktop. Filter by type, price, or category."
              />
              <StepCard
                number="2"
                title="Request a real video"
                text="Message on WhatsApp with the stone name or code. We'll send a short video of the actual stone in natural light — before anything is decided."
              />
              <StepCard
                number="3"
                title="Reserve or inquire"
                text="If you like it, reserve it via WhatsApp. Discuss price, payment (bank transfer or COD), and delivery directly."
              />
              <StepCard
                number="4"
                title="Wear it or turn it into jewelry"
                text="Keep the stone as-is, or ask about custom jewelry settings through our partner jewelers."
              />
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

        {/* ── WHO IS THIS FOR ── */}
        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <p className="lux-eyebrow">Find the right stone</p>
              <h2 className="lux-display mt-4 text-[1.8rem] text-white sm:text-[2.4rem]">
                What are you looking for?
              </h2>
            </motion.div>

            <div className="grid gap-4 sm:grid-cols-3">
              <BuyerCard
                eyebrow="Astrology & Birthstones"
                title="A stone with meaning"
                text="Looking for a natural blue sapphire, yellow sapphire, cat's eye, or other planetary stone? We can help you find the right one."
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

        {/* ── STONE TO JEWELRY ── */}
        <section className="px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={fadeUp}
            className="mx-auto max-w-6xl rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,18,32,0.72),rgba(6,11,22,0.9))] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-10 lg:p-12"
          >
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
              <div>
                <p className="lux-eyebrow-rule">Stone to Jewelry</p>
                <h2 className="lux-display mt-5 text-[1.9rem] text-white sm:text-[2.4rem]">
                  Turn your stone into something you can wear.
                </h2>
                <p className="mt-4 text-[14px] leading-relaxed text-slate-300">
                  After purchasing a gemstone from FacetVault, you can work with our partner jewelers to have it set into a ring, pendant, earring, or simple bezel setting.
                </p>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-400">
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
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/8 text-[12px] font-semibold text-amber-300">
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-[13px] font-semibold text-white">{title}</p>
                      <p className="mt-1 text-[12px] leading-relaxed text-slate-400">{text}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* ── TRUST ── */}
        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.15 }}
            variants={stagger}
            className="mx-auto max-w-6xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <p className="lux-eyebrow">Why trust FacetVault</p>
              <h2 className="lux-display mt-4 text-[1.8rem] text-white sm:text-[2.4rem]">
                Buying a gemstone should feel safe.
              </h2>
            </motion.div>

            <motion.div
              variants={stagger}
              className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2 lg:grid-cols-3"
            >
              {[
                {
                  icon: Video,
                  title: "Real videos on request",
                  text: "Message us and we'll send a short video of the actual stone before you decide anything.",
                },
                {
                  icon: MapPin,
                  title: "Sourced from Sri Lanka",
                  text: "All stones are sourced from Sri Lanka — purchased directly from Ratnapura gem markets and trusted local dealers.",
                },
                {
                  icon: ShieldCheck,
                  title: "Official LGL Gem Lab partner",
                  text: "FacetVault is partnered with LGL Gem Lab as our official gem certification partner. Certification is available for eligible stones — ask when you inquire.",
                },
                {
                  icon: MessageCircle,
                  title: "Founder-led support",
                  text: "You're talking directly to the founder on WhatsApp — not a bot, not a call centre.",
                },
                {
                  icon: Gem,
                  title: "No-pressure buying",
                  text: "Request a video, ask questions, and take your time. There's no cart, no checkout pressure.",
                },
                {
                  icon: ShieldCheck,
                  title: "Treatment disclosed",
                  text: "Heat treatment status is listed on each stone where known. We don't hide it.",
                },
              ].map(({ icon: Icon, title, text }) => (
                <motion.div
                  key={title}
                  variants={fadeUp}
                  className="rounded-[22px] border border-white/8 bg-white/[0.025] p-5"
                >
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full border border-amber-300/18 bg-amber-300/8">
                    <Icon size={14} className="text-amber-300" />
                  </div>
                  <h3 className="text-[13px] font-semibold text-white">{title}</h3>
                  <p className="mt-1.5 text-[12px] leading-relaxed text-slate-400">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FAQ ── */}
        <section className="px-4 pb-14 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.1 }}
            variants={stagger}
            className="mx-auto max-w-2xl"
          >
            <motion.div variants={fadeUp} className="mb-8 text-center">
              <p className="lux-eyebrow">Common Questions</p>
              <h2 className="lux-display mt-4 text-[1.8rem] text-white sm:text-[2.2rem]">
                FAQ
              </h2>
            </motion.div>

            <motion.div variants={fadeUp} className="rounded-[26px] border border-white/8 bg-white/[0.025] px-6 py-2">
              {FAQ_ITEMS.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </motion.div>
          </motion.div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="px-4 pb-24 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
            className="relative mx-auto max-w-5xl overflow-hidden rounded-[30px] border border-white/8 bg-[rgba(10,18,32,0.68)] p-8 text-center shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-md sm:p-10"
          >
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-0 h-[220px] w-[480px] -translate-x-1/2 rounded-full bg-amber-400/8 blur-3xl" />
            </div>

            <p className="lux-eyebrow">Ready to start?</p>
            <h2 className="lux-display mt-5 text-[1.85rem] text-white sm:text-[2.6rem]">
              Browse the collection or ask us anything.
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-gray-400">
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
    </>
  );
}

export default Home;
