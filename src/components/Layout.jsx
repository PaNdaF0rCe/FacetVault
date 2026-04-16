import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";
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

function Layout() {
  const location = useLocation();
  const [isAnimating, setIsAnimating] = useState(false);

  return (
    <div className="min-h-screen bg-[#020617] text-white">
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
          className={`${
            isAnimating ? "pointer-events-none" : ""
          }`}
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default Layout;