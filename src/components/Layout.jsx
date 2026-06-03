import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { WHATSAPP_NUMBER } from "../config/appConfig";

const WA_FAB = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm interested in a gemstone. Can you help?")}`;

// Hide FAB on routes that already have their own WhatsApp CTA
const HIDE_FAB_ROUTES = new Set(["/login", "/signup", "/"]);

// Opacity-only transition — no Y transform avoids scroll glitch on mobile
// during the animation frame window.
const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.28, ease: "easeOut" } },
  exit:    { opacity: 0, transition: { duration: 0.18 } },
};

// Routes where the footer should be hidden (auth, focused flows).
const NO_FOOTER_ROUTES = new Set(["/login", "/signup"]);

function Layout() {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const hideFooter =
    NO_FOOTER_ROUTES.has(location.pathname) ||
    location.pathname.startsWith("/admin");

  const hideFab =
    HIDE_FAB_ROUTES.has(location.pathname) ||
    location.pathname.startsWith("/admin");

  return (
    <div className="flex min-h-screen flex-col bg-[#020617] text-white">
      <Navbar />

      <AnimatePresence
        mode="wait"
        onExitComplete={() => setIsAnimating(false)}
      >
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          onAnimationStart={() => setIsAnimating(true)}
          onAnimationComplete={() => setIsAnimating(false)}
          className={`flex-1 pb-20 lg:pb-0 ${isAnimating ? "pointer-events-none" : ""}`}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {!hideFooter && <Footer />}

      {/* Sticky WhatsApp FAB — mobile only */}
      {!hideFab && (
        <a
          href={WA_FAB}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          className="fixed bottom-5 right-4 z-50 flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500 px-4 py-3 text-[13px] font-semibold text-white shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-transform active:scale-95 lg:hidden"
        >
          <MessageCircle size={17} strokeWidth={2} />
          WhatsApp
        </a>
      )}
    </div>
  );
}

export default Layout;
