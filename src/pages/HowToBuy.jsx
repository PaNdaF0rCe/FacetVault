import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "../config/appConfig";

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

        {/* CLOSING CTA */}
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

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/collection"
              className="inline-flex items-center justify-center rounded-2xl bg-amber-300 px-6 py-3 text-sm font-semibold text-[#09101c] shadow-sm transition duration-200 hover:brightness-105"
            >
              Browse Collection
            </Link>

            {WHATSAPP_NUMBER && (
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=Hi%2C%20I%27m%20interested%20in%20a%20gemstone%20from%20FacetVault.`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-3 text-sm font-medium text-white/80 transition duration-200 hover:border-amber-300/20 hover:text-white"
              >
                <MessageCircle size={16} />
                Ask on WhatsApp
              </a>
            )}
          </div>
        </motion.section>
      </div>
    </>
  );
}