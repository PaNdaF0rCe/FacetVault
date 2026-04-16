import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Navbar from "./Navbar";

const pageVariants = {
  initial: {
    opacity: 0,
    y: 10,
    scale: 0.995,
    filter: "blur(4px)",
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.32,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    scale: 0.995,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 1, 1],
    },
  },
};

function Layout() {
  const location = useLocation();
  const showNavbar = !["/login", "/signup"].includes(location.pathname);

  return (
    <div className="relative min-h-screen w-full max-w-full overflow-x-clip text-gray-100">
      {/* Background Layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-[#050810]" />

        <div className="absolute left-1/2 top-0 h-[420px] w-[760px] -translate-x-1/2 rounded-full bg-amber-400/5 blur-3xl md:h-[500px] md:w-[900px]" />

        <div className="absolute bottom-0 left-1/2 h-[320px] w-[680px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl md:h-[400px] md:w-[800px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(251,191,36,0.04),transparent_40%)]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_90%,rgba(59,130,246,0.05),transparent_45%)]" />
      </div>

      {showNavbar && <Navbar />}

      <main className="relative mx-auto w-full max-w-[1400px] min-w-0 overflow-x-clip px-3 py-4 sm:px-5 sm:py-6 lg:px-8">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full min-w-0 max-w-full"
          >
            <div className="w-full min-w-0 max-w-full overflow-x-clip">
              <Outlet />
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default Layout;