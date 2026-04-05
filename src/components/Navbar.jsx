import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo-diamond.png";

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

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

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020617] backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

        {/* Brand */}
        <Link to="/" className="flex items-center gap-3">
          <img
            src={logo}
            alt="FacetVault"
            className="h-11 w-11 object-contain"
          />

          <span className="text-xl font-semibold tracking-wide">
            <span className="text-amber-300">Facet</span>
            <span className="text-white">Vault</span>
          </span>
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">

          {/* Public collection */}
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

          {/* Admin only */}
          {isAdmin && (
            <Link
              to="/admin"
              className={`rounded-xl px-3 py-2 text-sm transition ${
                location.pathname === "/admin"
                  ? "bg-amber-400/20 text-amber-300"
                  : "text-amber-300/80 hover:bg-white/5"
              }`}
            >
              Admin
            </Link>
          )}

          {/* Auth buttons */}
          {!user ? (
            <>
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300"
              >
                Sign up
              </Link>
            </>
          ) : (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 text-amber-200 font-semibold">
                  {userInitial}
                </div>

                <div className="hidden sm:block text-left">
                  <p className="text-sm text-white">{displaySource}</p>
                  <p className="text-xs text-white/40">
                    {isAdmin ? "Admin" : "Account"}
                  </p>
                </div>
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-white/10 bg-[#0b1120] shadow-xl">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5 rounded-2xl"
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