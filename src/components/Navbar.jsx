import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, X, Bell, BellOff, Heart, MessageCircle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import logo from "../assets/logo-diamond.png";
import { getActiveCampaign } from "../lib/services/holidayCampaign";
import { requestNotificationPermission, silentlyRefreshToken } from "../lib/firebase/fcm";
import { useWishlist } from "../hooks/useWishlist";
import { WHATSAPP_NUMBER } from "../config/appConfig";

/* ─── shared ─────────────────────────────────────────────────────── */

const WA_NAV = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi FacetVault, I'm looking for a natural gemstone. Can you help me choose?")}`;

const HOME_SECTIONS = [
  { id: "sec-stones",     label: "Stones" },
  { id: "sec-categories", label: "Browse" },
  { id: "sec-how",        label: "How It Works" },
  { id: "sec-reviews",    label: "Reviews" },
  { id: "sec-faq",        label: "FAQ" },
];

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function LogoMark({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="flex min-w-0 items-center gap-3">
      <motion.img
        src={logo}
        alt="FacetVault"
        className="h-8 w-8 shrink-0 object-contain"
        whileHover={{ rotate: -4, scale: 1.04 }}
        transition={{ duration: 0.2 }}
      />
      <div className="min-w-0 leading-none">
        <div className="truncate text-[1rem] font-semibold tracking-[0.26em] text-amber-300">
          FACET VAULT
        </div>
        <div className="mt-0.5 hidden text-[9px] uppercase tracking-[0.32em] text-white/40 sm:block">
          Curated · Sri Lanka
        </div>
      </div>
    </button>
  );
}

/* ─── Customer navbar ─────────────────────────────────────────────── */

function CustomerNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === "/";
  const { count: wishlistCount } = useWishlist();
  const [active, setActive] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [heroPast, setHeroPast] = useState(false); // true once hero scrolls out

  // Show section strip only after hero scrolls out of view
  useEffect(() => {
    if (!isHome) { setHeroPast(false); return; }
    const el = document.getElementById("sec-hero");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setHeroPast(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [isHome]);

  // Track active section (home only)
  useEffect(() => {
    if (!isHome) { setActive(null); return; }
    const observers = HOME_SECTIONS.map(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return null;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-15% 0px -60% 0px", threshold: 0 }
      );
      obs.observe(el);
      return obs;
    });
    return () => observers.forEach((o) => o?.disconnect());
  }, [isHome]);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="sticky top-0 z-50 border-b border-white/[0.07] bg-[rgba(2,5,18,0.92)] backdrop-blur-xl"
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-300/22 to-transparent" />

        {/* Main bar */}
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-5 lg:px-8">
          {/* Logo */}
          <LogoMark onClick={() => navigate("/")} />

          {/* Desktop: section anchors (home, after hero) or page links (other) */}
          <nav className="hidden items-center gap-1 lg:flex">
            {isHome && heroPast ? (
              HOME_SECTIONS.map(({ id, label }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => scrollTo(id)}
                  className={`relative rounded-full px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.2em] transition-colors duration-200 ${
                    active === id
                      ? "text-amber-300"
                      : "text-white/42 hover:text-white/75"
                  }`}
                >
                  {label}
                  {active === id && (
                    <span className="absolute bottom-0.5 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-amber-300/80" />
                  )}
                </button>
              ))
            ) : (
              <>
                <Link
                  to="/"
                  className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${location.pathname === "/" ? "text-amber-300" : "text-white/42 hover:text-white/75"}`}
                >
                  Home
                </Link>
                <Link
                  to="/collection"
                  className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${location.pathname.startsWith("/collection") || location.pathname.startsWith("/stone") ? "text-amber-300" : "text-white/42 hover:text-white/75"}`}
                >
                  Collection
                </Link>
                <Link
                  to="/learn"
                  className={`rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.2em] transition-colors ${location.pathname === "/learn" ? "text-amber-300" : "text-white/42 hover:text-white/75"}`}
                >
                  Learn
                </Link>
              </>
            )}
          </nav>

          {/* Desktop right: wishlist + CTA */}
          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/wishlist"
              aria-label={`Wishlist${wishlistCount > 0 ? ` (${wishlistCount})` : ""}`}
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition-colors hover:text-rose-300"
            >
              <Heart size={16} strokeWidth={1.8} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 text-[9px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <a
              href={WA_NAV}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-[12px] font-semibold text-white shadow-[0_2px_10px_rgba(37,211,102,0.22)] transition-[transform,opacity] hover:opacity-90 active:scale-[0.97]"
            >
              <MessageCircle size={13} strokeWidth={2} />
              WhatsApp
            </a>

            {!isHome && (
              <Link
                to="/collection"
                className="rounded-full border border-amber-300/22 bg-amber-300/8 px-4 py-2 text-[12px] font-semibold text-amber-200 transition-colors hover:bg-amber-300/14"
              >
                Browse Stones
              </Link>
            )}
          </div>

          {/* Mobile: wishlist + hamburger */}
          <div className="flex items-center gap-2 lg:hidden">
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative flex h-9 w-9 items-center justify-center rounded-full text-white/45"
            >
              <Heart size={16} strokeWidth={1.8} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 text-[9px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((p) => !p)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-amber-300 hover:bg-white/5"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mobileOpen ? "x" : "menu"}
                  initial={{ opacity: 0, rotate: -30, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 30, scale: 0.8 }}
                  transition={{ duration: 0.16 }}
                  className="flex items-center justify-center"
                >
                  {mobileOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Mobile: section anchor strip — slides in after hero scrolls past */}
        {isHome && (
          <div className={`overflow-hidden border-t border-white/5 transition-[max-height,opacity] duration-300 lg:hidden ${heroPast ? "max-h-10 opacity-100" : "max-h-0 opacity-0"}`}>
          <div className="flex w-full items-center justify-around px-2 py-1.5">
            {HOME_SECTIONS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => { scrollTo(id); setMobileOpen(false); }}
                className={`relative flex-1 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] transition-colors ${
                  active === id ? "text-amber-300" : "text-white/32 hover:text-white/60"
                }`}
              >
                {label}
                {active === id && (
                  <span className="absolute bottom-0 left-1/2 h-[2px] w-3 -translate-x-1/2 rounded-full bg-amber-300/70" />
                )}
              </button>
            ))}
          </div>
          </div>
        )}
      </motion.header>

      {/* Mobile full-screen menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[60] bg-[rgba(2,6,23,0.97)] backdrop-blur-xl lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.06),transparent_60%)]" />

            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-h-screen flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header row */}
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-4">
                <LogoMark onClick={() => { navigate("/"); setMobileOpen(false); }} />
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-amber-300"
                >
                  <X size={22} strokeWidth={1.8} />
                </button>
              </div>

              {/* Links */}
              <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-16 pt-8">
                {[
                  { to: "/", label: "Home" },
                  { to: "/collection", label: "Collection" },
                  { to: "/learn", label: "Learn" },
                  { to: "/wishlist", label: wishlistCount > 0 ? `Wishlist (${wishlistCount})` : "Wishlist" },
                ].map(({ to, label }, i) => (
                  <motion.div
                    key={to}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.26, delay: 0.05 + i * 0.05 }}
                  >
                    <button
                      type="button"
                      onClick={() => { navigate(to); setMobileOpen(false); }}
                      className={`text-[clamp(1.8rem,4vw,3rem)] font-medium leading-none tracking-[-0.02em] transition-colors ${
                        location.pathname === to ? "text-amber-300" : "text-white hover:text-amber-200"
                      }`}
                    >
                      {label}
                    </button>
                  </motion.div>
                ))}

                <motion.a
                  href={WA_NAV}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.26, delay: 0.25 }}
                  onClick={() => setMobileOpen(false)}
                  className="mt-4 flex items-center gap-2 rounded-full bg-[#25D366] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_4px_20px_rgba(37,211,102,0.28)]"
                >
                  <MessageCircle size={16} strokeWidth={2} />
                  Chat on WhatsApp
                </motion.a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Admin navbar (original, unchanged) ─────────────────────────── */

function DesktopNavLink({ to, label, currentPath, index = 0, saleDot = false }) {
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
          className={`relative text-[11px] uppercase tracking-[0.28em] transition-colors duration-200 ${
            active ? "text-amber-300" : "text-white/62 hover:text-white/90"
          }`}
        >
          {label}
          {saleDot && (
            <span className="absolute -right-2 -top-0.5 h-1.5 w-1.5 rounded-full bg-amber-300" />
          )}
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
        className={`text-center text-[clamp(1.8rem,4vw,3rem)] leading-none tracking-[-0.02em] transition-colors duration-200 ${
          active ? "text-amber-300" : "text-white hover:text-amber-200"
        }`}
      >
        {label}
      </motion.button>
    </motion.div>
  );
}

function AdminNav() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { count: wishlistCount } = useWishlist();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [menuLocked, setMenuLocked] = useState(false);
  const [notifStatus, setNotifStatus] = useState("unknown");
  const activeCampaign = useMemo(() => getActiveCampaign(), []);

  useEffect(() => {
    if ("Notification" in window) {
      setNotifStatus(Notification.permission);
      if (Notification.permission === "granted") silentlyRefreshToken();
    }
  }, []);

  const enableNotifications = async () => {
    setNotifStatus("pending");
    const token = await requestNotificationPermission();
    setNotifStatus(token ? "granted" : Notification.permission);
  };

  const reopenBlockUntilRef = useRef(0);
  const routeLockTimerRef = useRef(null);
  const navTimerRef = useRef(null);

  const userInitial = (user?.displayName || user?.email || "U").trim().charAt(0).toUpperCase();

  const lockMenuBriefly = (ms = 500) => {
    setMenuLocked(true);
    reopenBlockUntilRef.current = Date.now() + ms;
    if (routeLockTimerRef.current) clearTimeout(routeLockTimerRef.current);
    routeLockTimerRef.current = setTimeout(() => setMenuLocked(false), ms);
  };

  const closeMobileMenu = (lockMs = 500) => {
    setMobileMenuOpen(false);
    lockMenuBriefly(lockMs);
  };

  const handleMobileNavigate = (to) => {
    closeMobileMenu(650);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
    navTimerRef.current = setTimeout(() => navigate(to), 120);
  };

  const handleMobileToggle = (event) => {
    event.stopPropagation();
    if (menuLocked) return;
    if (Date.now() < reopenBlockUntilRef.current) return;
    setMobileMenuOpen((prev) => !prev);
  };

  useEffect(() => { closeMobileMenu(550); }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === "Escape") closeMobileMenu(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  useEffect(() => () => {
    if (routeLockTimerRef.current) clearTimeout(routeLockTimerRef.current);
    if (navTimerRef.current) clearTimeout(navTimerRef.current);
  }, []);

  const handleLogout = async () => {
    closeMobileMenu(650);
    await logout();
    navigate("/");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/collection", label: "Collection" },
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
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: 0.05 }}>
            <Link to="/" className="flex min-w-0 items-center gap-3">
              <motion.img src={logo} alt="FacetVault" className="h-8 w-8 shrink-0 object-contain" whileHover={{ rotate: -4, scale: 1.04 }} transition={{ duration: 0.2 }} />
              <div className="min-w-0 leading-none">
                <div className="truncate text-[1rem] font-semibold tracking-[0.26em] text-amber-300 sm:text-[1.05rem]">FACET VAULT</div>
                <div className="mt-0.5 hidden text-[9px] uppercase tracking-[0.32em] text-white/40 sm:block">Curated · Sri Lanka</div>
              </div>
            </Link>
          </motion.div>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link, index) => (
              <DesktopNavLink key={link.to} to={link.to} label={link.label} currentPath={location.pathname} index={index} saleDot={link.to === "/collection" && !!activeCampaign} />
            ))}
            <DesktopNavLink to="/admin" label="Admin" currentPath={location.pathname} index={navLinks.length} />
            <DesktopNavLink to="/admin/leads" label="Leads" currentPath={location.pathname} index={navLinks.length + 1} />
            <DesktopNavLink to="/admin/drafts" label="Drafts" currentPath={location.pathname} index={navLinks.length + 2} />
            <motion.button
              type="button"
              onClick={notifStatus !== "pending" ? enableNotifications : undefined}
              title={notifStatus === "granted" ? "Notifications on — click to refresh token" : notifStatus === "pending" ? "Registering…" : "Enable push notifications"}
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.05 + (navLinks.length + 4) * 0.04 }}
              whileHover={{ y: -1 }}
              className={`transition-colors duration-200 ${notifStatus === "granted" ? "text-emerald-400/70 hover:text-emerald-300" : notifStatus === "pending" ? "animate-pulse text-amber-300/50" : "text-white/30 hover:text-amber-300"}`}
            >
              {notifStatus === "granted" || notifStatus === "pending" ? <Bell size={14} /> : <BellOff size={14} />}
            </motion.button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Wishlist */}
            <Link to="/wishlist" aria-label="Wishlist" className="relative hidden h-9 w-9 items-center justify-center rounded-full text-white/50 transition-colors hover:text-rose-300 lg:flex">
              <Heart size={17} strokeWidth={1.8} />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-400 px-1 text-[9px] font-bold text-white">
                  {wishlistCount > 9 ? "9+" : wishlistCount}
                </span>
              )}
            </Link>

            <div className="hidden items-center gap-3 lg:flex">
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.18 }} whileHover={{ y: -1 }}>
                <Link to="/admin" className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/8 text-xs font-semibold text-amber-200 transition-colors hover:border-amber-300/35" title={user?.displayName || user?.email || "Account"}>
                  {userInitial}
                </Link>
              </motion.div>
              <motion.button initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.28, delay: 0.22 }} whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }} onClick={handleLogout} className="text-[11px] uppercase tracking-[0.24em] text-white/60 hover:text-white/90">
                Logout
              </motion.button>
            </div>

            <motion.button type="button" onClick={handleMobileToggle} whileTap={{ scale: 0.94 }} disabled={menuLocked} className="inline-flex h-10 w-10 items-center justify-center rounded-full text-amber-300 hover:bg-white/5 disabled:pointer-events-none disabled:opacity-55 lg:hidden" aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={mobileMenuOpen ? "close" : "menu"} initial={{ opacity: 0, rotate: -40, scale: 0.8 }} animate={{ opacity: 1, rotate: 0, scale: 1 }} exit={{ opacity: 0, rotate: 40, scale: 0.8 }} transition={{ duration: 0.18 }} className="flex items-center justify-center">
                  {mobileMenuOpen ? <X size={22} strokeWidth={1.8} /> : <Menu size={22} strokeWidth={1.8} />}
                </motion.span>
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="fixed inset-0 z-[60] bg-[rgba(2,6,23,0.97)] backdrop-blur-xl lg:hidden" onClick={() => closeMobileMenu()}>
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.06),transparent_58%)]" />
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }} className="flex min-h-screen flex-col" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-white/6 px-4 py-4 sm:px-5">
                <button type="button" onClick={() => handleMobileNavigate("/")} className="flex items-center gap-3">
                  <img src={logo} alt="FacetVault" className="h-8 w-8 shrink-0 object-contain" />
                  <span className="text-[1rem] font-semibold tracking-[0.26em] text-amber-300">FACET VAULT</span>
                </button>
                <motion.button type="button" onClick={(e) => { e.stopPropagation(); closeMobileMenu(); }} whileTap={{ scale: 0.94 }} className="flex h-10 w-10 items-center justify-center rounded-full text-amber-300">
                  <X size={22} strokeWidth={1.8} />
                </motion.button>
              </div>

              <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-16 pt-10">
                {navLinks.map((link, index) => (
                  <MobileMenuButton key={link.to} label={link.label} active={location.pathname === link.to || (link.to !== "/" && location.pathname.startsWith(link.to))} index={index} onClick={() => handleMobileNavigate(link.to)} />
                ))}
                <MobileMenuButton label="Admin" active={location.pathname === "/admin"} index={navLinks.length} onClick={() => handleMobileNavigate("/admin")} />
                <MobileMenuButton label="Leads" active={location.pathname.startsWith("/admin/leads")} index={navLinks.length + 1} onClick={() => handleMobileNavigate("/admin/leads")} />
                <MobileMenuButton label="Drafts" active={location.pathname.startsWith("/admin/drafts")} index={navLinks.length + 2} onClick={() => handleMobileNavigate("/admin/drafts")} />
                <MobileMenuButton label={wishlistCount > 0 ? `Wishlist (${wishlistCount})` : "Wishlist"} active={location.pathname === "/wishlist"} index={navLinks.length + 3} onClick={() => handleMobileNavigate("/wishlist")} />
                <motion.button type="button" onClick={notifStatus !== "pending" ? enableNotifications : undefined} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.28, delay: 0.06 + (navLinks.length + 4) * 0.05 }}
                  className={`flex items-center gap-2 text-sm uppercase tracking-[0.2em] transition-colors ${notifStatus === "granted" ? "text-emerald-400" : notifStatus === "pending" ? "animate-pulse text-amber-300/50" : "text-white/40 hover:text-amber-200"}`}>
                  {notifStatus === "granted" || notifStatus === "pending" ? <Bell size={15} /> : <BellOff size={15} />}
                  {notifStatus === "granted" ? "Notifications on" : notifStatus === "pending" ? "Registering…" : "Enable notifications"}
                </motion.button>
                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.28, delay: 0.22 }} className="mt-6 flex flex-col items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-300/20 bg-amber-300/8 text-sm font-semibold text-amber-200">{userInitial}</div>
                  <button onClick={handleLogout} className="text-sm uppercase tracking-[0.24em] text-white/55 hover:text-white">Logout</button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─── Root: pick which navbar to render ──────────────────────────── */

function Navbar() {
  const { isAdmin } = useAuth();
  return isAdmin ? <AdminNav /> : <CustomerNav />;
}

export default Navbar;
