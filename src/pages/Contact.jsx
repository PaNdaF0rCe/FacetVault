import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { MessageCircle, Phone } from "lucide-react";

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

function ContactCard({ icon, title, text, action, link }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -2 }}
      className="rounded-[26px] border border-white/8 bg-white/[0.03] p-6 backdrop-blur-md"
    >
      <div className="flex items-center gap-3 text-amber-300">
        {icon}
        <h3 className="text-lg font-semibold text-white">{title}</h3>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-white/60">{text}</p>

      {action && link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-amber-300 transition-colors duration-200 hover:text-amber-200"
        >
          {action}
        </a>
      )}
    </motion.div>
  );
}

export default function Contact() {
  const whatsappLink =
    "https://wa.me/94774126030?text=Hi%20I%27m%20interested%20in%20a%20stone%20from%20FacetVault";

  return (
    <>
      <Helmet>
        <title>Contact | FacetVault</title>
        <meta
          name="description"
          content="Get in touch with FacetVault to inquire about gemstones."
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
            Contact
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-5 text-3xl font-semibold leading-tight text-white sm:text-5xl"
          >
            Get in touch directly.
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/60 sm:text-base"
          >
            For inquiries, availability, or additional details, reach out
            directly. The process is simple, clear, and personal.
          </motion.p>
        </motion.section>

        {/* CONTACT OPTIONS */}
        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={stagger}
          className="mx-auto mt-16 grid max-w-5xl gap-5 sm:grid-cols-2"
        >
          <ContactCard
            icon={<MessageCircle size={20} />}
            title="WhatsApp"
            text="The fastest way to inquire about a stone. Share the piece you're interested in and receive a direct response."
            action="Start conversation"
            link={whatsappLink}
          />

          <ContactCard
            icon={<Phone size={20} />}
            title="Direct Contact"
            text="Prefer a more direct approach? Reach out via phone for immediate assistance and discussion."
            action="Call now"
            link="tel:+94774126030"
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
            Every inquiry is handled directly.
            <br />
            Clear communication, no unnecessary steps.
          </p>
        </motion.section>
      </div>
    </>
  );
}