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

function StepCard({ step, title, text }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="rounded-[26px] border border-white/8 bg-white/[0.03] p-6 backdrop-blur-md"
    >
      <p className="text-[10px] uppercase tracking-[0.32em] text-amber-300/70">
        {step}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-white/60">{text}</p>
    </motion.div>
  );
}

export default function HowToBuy() {
  return (
    <>
      <Helmet>
        <title>How to Buy | FacetVault</title>
        <meta
          name="description"
          content="Learn how to purchase gemstones from FacetVault."
        />
      </Helmet>

      <div className="px-4 py-10 sm:px-6 lg:px-8">
        {/* HERO */}
        <motion.section
          initial="hidden"
          animate="show"
          variants={stagger}
          className="mx-auto max-w-5xl text-center"
        >
          <motion.p
            variants={fadeUp}
            className="text-[11px] uppercase tracking-[0.42em] text-amber-300/70"
          >
            How It Works
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-5xl"
          >
            A simple, direct way to acquire gemstones.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base"
          >
            FacetVault removes unnecessary complexity. You explore the collection,
            review each stone, and reach out directly when something stands out.
          </motion.p>
        </motion.section>

        {/* STEPS */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <StepCard
            step="Step 1"
            title="Browse the collection"
            text="Explore the available gemstones in a clean, distraction-free environment designed to highlight each piece."
          />

          <StepCard
            step="Step 2"
            title="Review the details"
            text="Open individual listings to view stone type, carat, color, origin, and pricing before making a decision."
          />

          <StepCard
            step="Step 3"
            title="Reach out directly"
            text="Use WhatsApp or contact options to inquire about availability, additional details, or purchasing."
          />
        </motion.section>

        {/* EXTRA INFO */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mx-auto mt-20 max-w-3xl space-y-6 text-sm leading-7 text-white/60 sm:text-base"
        >
          <p>
            Each inquiry is handled directly, allowing for clear communication,
            additional photos if needed, and confirmation before proceeding.
          </p>

          <p>
            This approach keeps the experience personal, transparent, and aligned
            with the nature of the stones themselves.
          </p>
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
            No unnecessary steps.
            <br />
            Just clarity, simplicity, and direct access.
          </p>
        </motion.section>
      </div>
    </>
  );
}