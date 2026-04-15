import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo-diamond.png";

function DesktopNavLink({ to, label, currentPath, admin = false }) {
  const active =
    currentPath === to || (to !== "/" && currentPath.startsWith(to));

  return (
    <Link
      to={to}
      className={`relative rounded-full px-4 py-2 text-sm font-medium tracking-[0.03em] transition-all duration-200 ${
        active
          ? admin
            ? "bg-amber-400 text-black shadow-[0_10px_30px_rgba(251,191,36,0.25)]"
            : "bg-white/10 text-white backdrop-blur-md"
          : admin
          ? "text-amber-300/90 hover:bg-amber-400/10 hover:text-amber-200"
          : "text-white/75 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function MobileMenuLink({
  to,
  label,
  currentPath,
  onClick,
  admin = false,
}) {
  const active =
    currentPath === to || (to !== "/" && currentPath.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block rounded-2xl px-4 py-3 text-sm transition ${
        active
          ? admin
            ? "bg-amber-400 text-black"
            : "bg-white/10 text-white"
          : admin
          ? "text-amber-300 hover:bg-white/5"
          : "text-white/85 hover:bg-white/5 hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}

function AccountDropdown({
  displaySource,
  isAdmin,
  onLogout,
  onClose,
  currentPath,
}) {
  return (
    <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-[20px] border border-white/10 bg-[linear-gradient(180deg,rgba(2,6,23,0.98),rgba(7,18,36,0.98))] shadow-[0_30px_70px_rgba(0,0,0,0.45)] backdrop-blur-xl">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="truncate text-sm font-medium text-white">{displaySource}</p>
        <p className="mt-1 text-xs text-white/40">
          {isAdmin ? "Admin account" : "Account"}
        </p>
      </div>

      <div className="p-2 md:hidden">
        <MobileMenuLink
          to="/collection"
          label="Collection"
          currentPath={currentPath}
          onClick={onClose}
        />
        <MobileMenuLink
          to="/about"
          label="About"
          currentPath={currentPath}
          onClick={onClose}
        />
        <MobileMenuLink
          to="/how-to-buy"
          label="How to Buy"
          currentPath={currentPath}
          onClick={onClose}
        />
        <MobileMenuLink
          to="/contact"
          label="Contact"
          currentPath={currentPath}
          onClick={onClose}
        />

        {isAdmin && (
          <MobileMenuLink
            to="/admin"
            label="Admin"
            currentPath={currentPath}
            onClick={onClose}
            admin
          />
        )}
      </div>

      <div className="border-t border-white/10" />

      <button
        onClick={onLogout}
        className="w-full px-4 py-3 text-left text-sm text-white/85 transition hover:bg-white/5 hover:text-white"
      >
        Logout
      </button>
    </div>
  );
}

function GuestActions({ currentPath }) {
  return (
    <div className="flex items-center gap-2">
      <Link
        to="/login"
        className={`hidden rounded-full px-4 py-2 text-sm font-medium transition sm:inline-flex ${
          currentPath === "/login"
            ? "bg-white/10 text-white"
            : "text-white/80 hover:bg-white/5 hover:text-white"
        }`}
      >
        Login
      </Link>

      <Link
        to="/signup"
        className={`hidden rounded-full px-4 py-2 text-sm font-semibold transition sm:inline-flex ${
          currentPath === "/signup"
            ? "bg-amber-300 text-black"
            : "bg-amber-400 text-black hover:bg-amber-300 shadow-[0_8px_25px_rgba(251,191,36,0.25)]"
        }`}
      >
        Sign Up
      </Link>

      <Link
        to="/login"
        className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white transition hover:border-white/20 hover:bg-white/[0.08] sm:hidden"
        aria-label="Login"
      >
        👤
      </Link>
    </div>
  );
}

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displaySource = user?.displayName || user?.email || "User";
  const userInitial = displaySource.trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = async () => {
    closeMenu();
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,0.75))] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-white/5" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex min-w-0 items-center gap-3 group">
          <img
            src={logo}
            alt="FacetVault"
            className="h-8 w-8 object-contain transition-transform duration-300 group-hover:scale-105"
          />

          <div className="min-w-0">
            <div className="truncate text-[1.05rem] font-semibold tracking-[0.05em] sm:text-[1.15rem]">
              <span className="text-amber-300">Facet</span>
              <span className="text-white">Vault</span>
            </div>
            <p className="hidden text-[10px] uppercase tracking-[0.22em] text-white/30 sm:block">
              Curated Gemstones
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <DesktopNavLink
            to="/collection"
            label="Collection"
            currentPath={location.pathname}
          />
          <DesktopNavLink
            to="/about"
            label="About"
            currentPath={location.pathname}
          />
          <DesktopNavLink
            to="/how-to-buy"
            label="How to Buy"
            currentPath={location.pathname}
          />
          <DesktopNavLink
            to="/contact"
            label="Contact"
            currentPath={location.pathname}
          />

          {isAdmin && (
            <DesktopNavLink
              to="/admin"
              label="Admin"
              currentPath={location.pathname}
              admin
            />
          )}
        </nav>

        <div className="flex items-center gap-2">
          {!user ? (
            <GuestActions currentPath={location.pathname} />
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1.5 text-sm text-white transition hover:border-white/20 hover:bg-white/[0.08]"
                aria-label="Open account menu"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-amber-400/25 bg-amber-400/10 text-sm font-semibold text-amber-200">
                  {userInitial}
                </div>

                <div className="hidden min-w-0 text-left lg:block">
                  <p className="max-w-[180px] truncate text-sm font-medium text-white">
                    {displaySource}
                  </p>
                  <p className="text-[10px] uppercase tracking-[0.22em] text-white/35">
                    {isAdmin ? "Admin" : "Account"}
                  </p>
                </div>
              </button>

              {menuOpen && (
                <AccountDropdown
                  displaySource={displaySource}
                  isAdmin={isAdmin}
                  onLogout={handleLogout}
                  onClose={closeMenu}
                  currentPath={location.pathname}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;