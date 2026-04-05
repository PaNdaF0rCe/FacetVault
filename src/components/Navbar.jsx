import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo-diamond.png";

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

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020617]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-2 sm:gap-3">
          <img
            src={logo}
            alt="FacetVault"
            className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
          />

          <span className="text-lg font-semibold tracking-wide sm:text-xl">
            <span className="text-amber-300">Facet</span>
            <span className="text-white">Vault</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-2 sm:gap-3">

          {/* Collection (always visible) */}
          <Link
            to="/collection"
            className={`rounded-xl px-3 py-2 text-sm transition ${
              location.pathname === "/collection"
                ? "bg-white/10 text-white"
                : "text-white/80 hover:bg-white/5 hover:text-white"
            }`}
          >
            Collection
          </Link>

          {/* Admin Toggle */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`rounded-xl px-3 py-2 text-sm transition ${
                location.pathname === "/admin"
                  ? "bg-amber-400/20 text-amber-300"
                  : "text-amber-300/70 hover:bg-white/5 hover:text-amber-300"
              }`}
            >
              Admin
            </Link>
          )}

          {/* Auth section */}
          {!user ? (
            <>
              {/* Desktop */}
              <Link
                to="/login"
                className="hidden sm:block rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="hidden sm:block rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Sign up
              </Link>

              {/* Mobile icon */}
              <Link
                to="/login"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white sm:hidden"
              >
                👤
              </Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 sm:gap-3 rounded-xl border border-white/10 bg-white/5 px-2 py-2 sm:px-3 transition hover:bg-white/10"
              >
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-amber-400/20 text-amber-200 font-semibold">
                  {userInitial}
                </div>

                {/* Hide text on mobile */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm text-white truncate max-w-[140px]">
                    {displaySource}
                  </p>
                  <p className="text-xs text-white/40">
                    {isAdmin ? "Admin" : "Account"}
                  </p>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0b1120] shadow-xl overflow-hidden">

                  {/* Admin quick switch */}
                  {isAdmin && (
                    <>
                      <Link
                        to="/collection"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-white hover:bg-white/5"
                      >
                        View Collection
                      </Link>

                      <Link
                        to="/admin"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 text-sm text-amber-300 hover:bg-white/5"
                      >
                        Admin Dashboard
                      </Link>

                      <div className="border-t border-white/10" />
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5"
                  >
                    Logout
                  </button>

                </div>
              )}
            </div>
          )}

        </nav>
      </div>
    </header>
  );
}

export default Navbar;