import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const displaySource =
    user?.displayName ||
    user?.email ||
    user?.username ||
    "User";

  const userInitial = displaySource.trim().charAt(0).toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
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
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-2.5 py-2 text-white transition hover:border-amber-400/40 hover:bg-white/10"
              aria-label="Open account menu"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-sm font-semibold text-amber-300">
                {userInitial}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[160px] truncate text-sm font-medium text-white">
                  {displaySource}
                </p>
                <p className="text-xs text-gray-400">Account</p>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#091427] shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm font-medium text-white">
                    {displaySource}
                  </p>
                  <p className="text-xs text-gray-400">Signed in</p>
                </div>

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