import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
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

function ValueCard({ title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="lux-card-elevated p-7"
    >
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{text}</p>
    </motion.div>
  );
}

export default function About() {
  return (
    <>
      <Helmet>
        <title>About FacetVault | Curated Ceylon Gemstones from Sri Lanka</title>
        <meta
          name="description"
          content="FacetVault is a curated gemstone brand from Sri Lanka — presenting individually selected Ceylon sapphires and natural gems with clarity, intention, and direct inquiry."
        />
        <link rel="canonical" href="https://facetvault.store/about" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://facetvault.store/about" />
        <meta property="og:title" content="About FacetVault | Curated Ceylon Gemstones from Sri Lanka" />
        <meta property="og:description" content="FacetVault presents individually selected Ceylon sapphires and natural gems with clarity and intention. Learn the story behind the collection." />
        <meta property="og:image" content="https://facetvault.store/logo.png" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="About FacetVault | Curated Ceylon Gemstones" />
        <meta name="twitter:description" content="FacetVault presents individually selected Ceylon sapphires and natural gems with clarity and intention." />
        <meta name="twitter:image" content="https://facetvault.store/logo.png" />
      </Helmet>

      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <motion.section
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.p variants={fadeUp} className="lux-eyebrow">
            About FacetVault
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="lux-display mt-6 text-[2.2rem] text-white sm:text-[3.6rem]"
          >
            A{" "}
            <span className="lux-display-italic text-amber-200/95">quieter</span>{" "}
            way to explore gemstones.
          </motion.h1>

          <motion.div
            variants={fadeUp}
            className="mx-auto mt-7 h-px w-12 bg-gradient-to-r from-transparent via-amber-300/55 to-transparent"
          />

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base"
          >
            FacetVault is built around a simple idea — gemstones should be
            presented with clarity, intention, and respect for the piece itself.
            Not buried in clutter, and not treated like generic listings.
          </motion.p>
        </motion.section>

        {/* MAIN STORY */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto mt-14 max-w-4xl space-y-6 text-sm leading-7 text-white/60 sm:text-base"
        >
          <p>
            Each stone in the collection is selected individually, focusing on
            character, visual appeal, and overall presence. The goal is not to
            present volume, but to present pieces that feel considered.
          </p>

          <p>
            Instead of overwhelming buyers with dense marketplaces and complex
            checkout systems, FacetVault keeps the process simple — explore,
            review, and inquire directly when something stands out.
          </p>

          <p>
            This creates a more personal and transparent experience, while still
            maintaining a clean and modern presentation across both mobile and
            desktop.
          </p>
        </motion.section>

        {/* VALUES */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ValueCard
            title="Curated Selection"
            text="Every stone is chosen individually rather than added in bulk, focusing on quality and presentation."
          />

          <ValueCard
            title="Clear Presentation"
            text="Essential details are presented cleanly, allowing buyers to understand each piece quickly."
          />

          <ValueCard
            title="Direct Inquiry"
            text="No unnecessary checkout systems — communication stays simple and direct."
          />
        </motion.section>

        {/* CLOSING */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto mt-20 max-w-3xl text-center"
        >
          <p className="text-sm leading-relaxed text-white/60 sm:text-base">
            FacetVault is not designed to feel like a marketplace.
            <br />
            It is designed to feel like a collection.
          </p>
        </motion.section>
      </div>
    </>
  );
}