import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#050a16]/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          to={user ? "/dashboard" : "/"}
          className="text-xl font-semibold tracking-[0.02em] text-amber-400 sm:text-2xl"
        >
          FacetVault
        </Link>

        {user && isDashboard && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-white transition hover:border-white/20 hover:bg-white/10"
              aria-label="Open menu"
            >
              ☰
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-2xl border border-white/10 bg-[#091427] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="w-full px-4 py-3 text-left text-sm font-medium text-white transition hover:bg-white/5"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;