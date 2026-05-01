import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/logo-diamond.png";

function DesktopNavLink({ to, label, currentPath, index = 0 }) {
  const active = currentPath === to || (to !== "/" && currentPath.startsWith(to));

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: 0.05 + index * 0.04 }}
    >
      <motion.div whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
        <Link
          to={to}
          className={`text-[11px] uppercase tracking-[0.28em] transition-colors duration-200 ${
            active ? "text-amber-300" : "text-white/42 hover:text-white/80"
          }`}
        >
          {label}
        </Link>
      </motion.div>
    </motion.div>
  );
}

function MobileMenuButton({ label, active, onClick, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.28, delay: 0.06 + index * 0.05 }}
    >
      <motion.button
        type="button"
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.985 }}
        className={`text-center text-[clamp(2rem,5vw,3.2rem)] leading-none tracking-[-0.02em] transition-colors duration-200 ${
          active ? "text-amber-300" : "text-white hover:text-amber-200"
        }`}
      >
        {label}
      </motion.button>
    </motion.div>
  );
}

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuLocked, setMenuLocked] = useState(false);

  const reopenBlockUntilRef = useRef(0);
  const routeLockTimerRef = useRef(null);
  const navTimerRef = useRef(null);

  const userInitial = (user?.displayName || user?.email || "U")
    .trim()
    .charAt(0)
    .toUpperCase();

  const lockMenuBriefly = (ms = 500) => {
    setMenuLocked(true);
    reopenBlockUntilRef.current = Date.now() + ms;

    if (routeLockTimerRef.current) clearTimeout(routeLockTimerRef.current);
    routeLockTimerRef.current = setTimeout(() => {
      setMenuLocked(false);
    }, ms);
  };

  const closeMobileMenu = (lockMs = 500) => {
    setMobileMenuOpen(false);
    lockMenuBriefly(lockMs);
  };

  const handleMobileNavigate = (to) => {
    closeMobileMenu(650);

    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => {
      navigate(to);
    }, 120);
  };

  const handleMobileToggle = (event) => {
    event.stopPropagation();

    if (menuLocked) return;
    if (Date.now() < reopenBlockUntilRef.current) return;

    setMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => {
    closeMobileMenu(550);
    return undefined;
  }, [location.pathname, location.search, location.hash]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    return () => {
      if (routeLockTimerRef.current) clearTimeout(routeLockTimerRef.current);
      if (navTimerRef.current) clearTimeout(navTimerRef.current);
    };
  }, []);

  const handleLogout = async () => {
    closeMobileMenu(650);
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/collection", label: "Collection" },
    { to: "/about", label: "About" },
    { to: "/how-to-buy", label: "How to Buy" },
    { to: "/contact", label: "Contact" },
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b border-white/6 bg-[rgba(2,6,23,0.82)] backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/20 to-transparent" />

        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 sm:px-5 lg:px-8">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <motion.img
                src={logo}
                alt="FacetVault"
                className="h-8 w-8 shrink-0 object-contain"
                whileHover={{ rotate: -4, scale: 1.04 }}
                transition={{ duration: 0.2 }}
              />

              <div className="min-w-0">
                <div className="truncate text-[1rem] font-semibold tracking-[0.26em] text-amber-300 sm:text-[1.05rem]">
                  FACET VAULT
                </div>
              </div>
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link, index) => (
              <DesktopNavLink
                key={link.to}
                to={link.to}
                label={link.label}
                currentPath={location.pathname}
                index={index}
              />
            ))}

            {isAdmin && (
  <>
    <DesktopNavLink
      to="/admin"
      label="Admin"
      currentPath={location.pathname}
      index={navLinks.length}
    />

    <DesktopNavLink
      to="/admin/leads"
      label="Leads"
      currentPath={location.pathname}
      index={navLinks.length + 1}
    />
  </>
)}
          </nav>

          <div className="flex items-center gap-3">
            {!user ? (
              <div className="hidden items-center gap-4 lg:flex">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.18 }}
                >
                  <Link
                    to="/login"
                    className="text-[11px] uppercase tracking-[0.24em] text-white/46 transition-colors duration-200 hover:text-white/80"
                  >
                    Login
                  </Link>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.22 }}
                >
                  <Link
                    to="/signup"
                    className="text-[11px] uppercase tracking-[0.24em] text-amber-300 transition-colors duration-200 hover:text-amber-200"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            ) : (
              <div className="hidden items-center gap-3 lg:flex">
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.18 }}
                  whileHover={{ y: -1 }}
                >
                  <Link
                    to={isAdmin ? "/admin" : "/collection"}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/8 text-xs font-semibold text-amber-200 transition-colors duration-200 hover:border-amber-300/35 hover:bg-amber-300/12"
                    title={user?.displayName || user?.email || "Account"}
                  >
                    {userInitial}
                  </Link>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.22 }}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout}
                  className="text-[11px] uppercase tracking-[0.24em] text-white/46 transition-colors duration-200 hover:text-white/80"
                >
                  Logout
                </motion.button>
              </div>
            )}

            <motion.button
              type="button"
              onClick={handleMobileToggle}
              whileTap={{ scale: 0.94 }}
              disabled={menuLocked}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-amber-300 transition-colors duration-200 hover:bg-white/5 hover:text-amber-200 disabled:pointer-events-none disabled:opacity-55 lg:hidden"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileMenuOpen ? "close" : "menu"}
                  initial={{ opacity: 0, rotate: -40, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 40, scale: 0.8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center justify-center"
                >
                  {mobileMenuOpen ? (
                    <X size={22} strokeWidth={1.8} />
                  ) : (
                    <Menu size={22} strokeWidth={1.8} />
                  )}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-[rgba(2,6,23,0.97)] backdrop-blur-xl lg:hidden"
            onClick={() => closeMobileMenu()}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.06),transparent_58%)]" />

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-screen flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-4 sm:px-5">
                <button
                  type="button"
                  onClick={() => handleMobileNavigate("/")}
                  className="flex items-center gap-3"
                >
                  <img
                    src={logo}
                    alt="FacetVault"
                    className="h-8 w-8 shrink-0 object-contain"
                  />
                  <span className="text-[1rem] font-semibold tracking-[0.24em] text-amber-300">
                    FACET VAULT
                  </span>
                </button>

                <motion.button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    closeMobileMenu();
                  }}
                  whileTap={{ scale: 0.94 }}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full text-amber-300 transition-colors duration-200 hover:bg-white/5 hover:text-amber-200"
                  aria-label="Close menu"
                >
                  <X size={22} strokeWidth={1.8} />
                </motion.button>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16 pt-10">
                {navLinks.map((link, index) => (
                  <MobileMenuButton
                    key={link.to}
                    label={link.label}
                    active={
                      location.pathname === link.to ||
                      (link.to !== "/" && location.pathname.startsWith(link.to))
                    }
                    index={index}
                    onClick={() => handleMobileNavigate(link.to)}
                  />
                ))}

                {isAdmin && (
  <>
    <MobileMenuButton
      label="Admin"
      active={location.pathname === "/admin"}
      index={navLinks.length}
      onClick={() => handleMobileNavigate("/admin")}
    />

    <MobileMenuButton
      label="Leads"
      active={location.pathname.startsWith("/admin/leads")}
      index={navLinks.length + 1}
      onClick={() => handleMobileNavigate("/admin/leads")}
    />
  </>
)}

                {!user ? (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.28, delay: 0.22 }}
                    className="mt-4 flex flex-col items-center gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("/login")}
                      className="text-sm uppercase tracking-[0.24em] text-white/55 transition-colors duration-200 hover:text-white"
                    >
                      Login
                    </button>

                    <button
                      type="button"
                      onClick={() => handleMobileNavigate("/signup")}
                      className="text-sm uppercase tracking-[0.24em] text-amber-300 transition-colors duration-200 hover:text-amber-200"
                    >
                      Sign Up
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.28, delay: 0.22 }}
                    className="mt-6 flex flex-col items-center gap-4"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/8 text-sm font-semibold text-amber-200">
                      {userInitial}
                    </div>

                    <button
                      onClick={handleLogout}
                      className="text-sm uppercase tracking-[0.24em] text-white/55 transition-colors duration-200 hover:text-white"
                    >
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;