import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";

const fadeUp = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.08,
    },
  },
};

function StatCard({ label, text }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="rounded-[22px] border border-white/8 bg-white/[0.025] px-5 py-4 backdrop-blur-md"
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/68">
        {label}
      </p>
      <p className="mt-2 text-sm text-white/92">{text}</p>
    </motion.div>
  );
}

function ValueCard({ eyebrow, title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -3 }}
      transition={{ duration: 0.25 }}
      className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015))] p-6 shadow-[0_12px_36px_rgba(0,0,0,0.16)] backdrop-blur-md"
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/72">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-xl font-semibold text-white">{title}</h2>
      <p className="mt-3 text-sm leading-relaxed text-slate-300">{text}</p>
    </motion.div>
  );
}

function ProcessCard({ step, title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.25 }}
      className="rounded-[22px] border border-white/8 bg-white/[0.03] p-5"
    >
      <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/68">
        {step}
      </p>
      <h3 className="mt-2 text-base font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">{text}</p>
    </motion.div>
  );
}

function Home() {
  return (
    <>
    <Helmet>
      <title>FacetVault | Ceylon Sapphires & Curated Gemstones from Sri Lanka</title>
      <meta
        name="description"
        content="Browse natural Ceylon sapphires and individually curated gemstones sourced directly from Sri Lanka. Clear details, transparent pricing, direct WhatsApp inquiry."
      />
      <link rel="canonical" href="https://facetvault.store/" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="https://facetvault.store/" />
      <meta property="og:title" content="FacetVault | Ceylon Sapphires & Curated Gemstones from Sri Lanka" />
      <meta property="og:description" content="Browse natural Ceylon sapphires and individually curated gemstones sourced directly from Sri Lanka. Clear details, transparent pricing, direct WhatsApp inquiry." />
      <meta property="og:image" content="https://facetvault.store/logo.png" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content="FacetVault | Ceylon Sapphires & Curated Gemstones from Sri Lanka" />
      <meta name="twitter:description" content="Browse natural Ceylon sapphires and individually curated gemstones sourced directly from Sri Lanka." />
      <meta name="twitter:image" content="https://facetvault.store/logo.png" />
      <script type="application/ld+json">{JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "FacetVault",
        "url": "https://facetvault.store",
        "description": "Curated natural gemstones and Ceylon sapphires sourced directly from Sri Lanka.",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://facetvault.store/collection",
          "query-input": "required name=search_term_string"
        }
      })}</script>
    </Helmet>
    <div className="flex flex-col">
      {/* HERO */}
      <section className="relative px-4 pb-20 pt-16 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8 lg:pt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center">
          <div className="h-[260px] w-[640px] rounded-full bg-amber-400/6 blur-3xl" />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mx-auto max-w-6xl"
        >
          <div className="mx-auto max-w-4xl text-center">
            <motion.p variants={fadeUp} className="lux-eyebrow">
              FacetVault — Sri Lanka
            </motion.p>

            <motion.h1
              variants={fadeUp}
              className="lux-display mx-auto mt-7 max-w-4xl text-[2.6rem] text-white sm:text-[4.4rem] lg:text-[5.2rem]"
            >
              Curated gemstones,
              <br className="hidden sm:block" />{" "}
              <span className="lux-display-italic text-amber-200/95">
                presented with intention.
              </span>
            </motion.h1>

            <motion.div
              variants={fadeUp}
              className="mx-auto mt-7 h-px w-16 bg-gradient-to-r from-transparent via-amber-300/55 to-transparent"
            />

            <motion.p
              variants={fadeUp}
              className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-[17px]"
            >
              A refined way to explore individually selected gemstones with
              clear details, direct inquiry, and a browsing experience designed
              to feel quiet, elegant, and focused on the stone itself.
            </motion.p>

            <motion.div
              variants={fadeUp}
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <Link
                to="/collection"
                className="lux-button-primary min-w-[220px]"
              >
                Explore Collection
              </Link>

              <Link
                to="/how-to-buy"
                className="lux-button-secondary min-w-[220px]"
              >
                How to Buy
              </Link>
            </motion.div>
          </div>

          <motion.div
            variants={stagger}
            className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <StatCard
              label="Selection"
              text="Individually chosen stones"
            />
            <StatCard
              label="Clarity"
              text="Clear, considered presentation"
            />
            <StatCard
              label="Inquiry"
              text="Direct contact without friction"
            />
          </motion.div>
        </motion.div>
      </section>

      {/* VALUE STRIP */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={stagger}
          className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3"
        >
          <ValueCard
            eyebrow="Curated Individually"
            title="Not a bulk catalog"
            text="Each stone is added with attention to character, presentation, and overall appeal rather than being treated as just another listing."
          />

          <ValueCard
            eyebrow="Clear Presentation"
            title="Details that matter"
            text="Review essential information such as stone type, carat, color, cut, origin, and pricing before deciding whether to inquire."
          />

          <ValueCard
            eyebrow="Direct Communication"
            title="Inquiry made simple"
            text="Reach out through WhatsApp or phone without unnecessary checkout steps, marketplace clutter, or distractions."
          />
        </motion.div>
      </section>

      {/* STORY / POSITIONING */}
      <section className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          variants={fadeUp}
          className="mx-auto max-w-6xl rounded-[34px] border border-white/8 bg-[linear-gradient(180deg,rgba(10,18,32,0.72),rgba(6,11,22,0.9))] p-8 shadow-[0_24px_70px_rgba(0,0,0,0.24)] backdrop-blur-md sm:p-10 lg:p-12"
        >
          <div className="grid gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-14">
            <div>
              <p className="lux-eyebrow-rule">The Collection</p>

              <h2 className="lux-display mt-5 max-w-2xl text-[2rem] text-white sm:text-[2.6rem]">
                Built for people who prefer a more thoughtful way to browse
                gemstones.
              </h2>

              <div className="mt-6 space-y-4 text-sm leading-7 text-slate-300 sm:text-base">
                <p>
                  FacetVault presents gemstones in a cleaner, more intentional
                  format — where the focus stays on the piece, its details, and
                  the ease of direct inquiry.
                </p>

                <p>
                  Instead of overwhelming buyers with clutter, the aim is to
                  make every listing feel considered, informative, and elegant
                  to explore across both desktop and mobile.
                </p>

                <p>
                  The result is a browsing experience that feels more curated,
                  more transparent, and more aligned with the quality of the
                  stones themselves.
                </p>
              </div>
            </div>

            <motion.div
              variants={stagger}
              className="grid gap-4 self-start"
            >
              <ProcessCard
                step="Browse"
                title="Explore the collection"
                text="View available stones in a clean, mobile-friendly collection designed to keep the focus on the gemstones."
              />
              <ProcessCard
                step="Review"
                title="Open each listing"
                text="Check the key details, presentation, and pricing before deciding whether a stone is worth asking about."
              />
              <ProcessCard
                step="Inquire"
                title="Reach out directly"
                text="Contact for availability, pricing confirmation, or additional photos without unnecessary extra steps."
              />
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-28 sm:px-6 lg:px-8">
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

          <p className="lux-eyebrow">Begin Browsing</p>

          <h2 className="lux-display mt-5 text-[1.85rem] text-white sm:text-[2.6rem]">
            Start with the collection.
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-400 sm:text-base">
            View available stones, explore their details, and inquire directly
            when something stands out.
          </p>

          <motion.div
            variants={fadeUp}
            className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <Link
              to="/collection"
              className="lux-button-primary min-w-[220px]"
            >
              Browse Collection
            </Link>

            <Link
              to="/contact"
              className="lux-button-secondary min-w-[220px]"
            >
              Contact Directly
            </Link>
          </motion.div>
        </motion.div>
      </section>
    </div>
    </>
  );
}

export default Home;