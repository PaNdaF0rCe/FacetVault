import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useState } from "react";

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: 8,
    transition: { duration: 0.2 },
  },
};

// Routes where the footer should be hidden (auth, focused flows).
const NO_FOOTER_ROUTES = new Set(["/login", "/signup"]);

function Layout() {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  const hideFooter =
    NO_FOOTER_ROUTES.has(location.pathname) ||
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
          className={`flex-1 ${isAnimating ? "pointer-events-none" : ""}`}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>

      {!hideFooter && <Footer />}
    </div>
  );
}

export default Layout;
