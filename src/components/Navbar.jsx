import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo-diamond.png";

function NavPill({ to, active, children, accent = "default", onClick }) {
  const base =
    "rounded-xl px-3 py-2 text-sm transition text-center whitespace-nowrap";
  const styles =
    accent === "admin"
      ? active
        ? "bg-amber-400/20 text-amber-300"
        : "text-amber-300/80 hover:bg-white/5 hover:text-amber-300"
      : active
      ? "bg-white/10 text-white"
      : "text-white/80 hover:bg-white/5 hover:text-white";

  return (
    <Link to={to} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </Link>
  );
}

function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  console.log("Current UID:", user?.uid);
  console.log("Admin UID:", import.meta.env.VITE_ADMIN_UID);
  console.log("isAdmin:", isAdmin);
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

  const handleLogout = async () => {
    setMenuOpen(false);
    await logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020617]/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <img
              src={logo}
              alt="FacetVault"
              className="h-9 w-9 object-contain sm:h-11 sm:w-11"
            />

            <span className="truncate text-lg font-semibold tracking-wide sm:text-xl">
              <span className="text-amber-300">Facet</span>
              <span className="text-white">Vault</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 sm:flex">
            <NavPill
              to="/collection"
              active={location.pathname === "/collection"}
            >
              Collection
            </NavPill>

            {isAdmin && (
              <NavPill
                to="/admin"
                active={location.pathname === "/admin"}
                accent="admin"
              >
                Admin
              </NavPill>
            )}

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
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400/20 font-semibold text-amber-200">
                    {userInitial}
                  </div>

                  <div className="text-left">
                    <p className="max-w-[140px] truncate text-sm text-white">
                      {displaySource}
                    </p>
                    <p className="text-xs text-white/40">
                      {isAdmin ? "Admin" : "Account"}
                    </p>
                  </div>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] shadow-xl">
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
          </div>

          <div className="relative sm:hidden" ref={menuRef}>
            {!user ? (
              <div className="flex items-center gap-2">
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

                <Link
                  to="/login"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
                >
                  👤
                </Link>
              </div>
            ) : (
              <button
                onClick={() => setMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2 transition hover:bg-white/10"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 font-semibold text-amber-200">
                  {userInitial}
                </div>
              </button>
            )}

            {user && menuOpen && (
              <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] shadow-xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm text-white">{displaySource}</p>
                  <p className="text-xs text-white/40">
                    {isAdmin ? "Admin" : "Account"}
                  </p>
                </div>

                <Link
                  to="/collection"
                  onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-3 text-sm hover:bg-white/5 ${
                    location.pathname === "/collection"
                      ? "text-white"
                      : "text-white/80"
                  }`}
                >
                  Collection
                </Link>

                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 text-sm hover:bg-white/5 ${
                      location.pathname === "/admin"
                        ? "text-amber-300"
                        : "text-amber-300/80"
                    }`}
                  >
                    Admin
                  </Link>
                )}

                {!user && (
                  <Link
                    to="/signup"
                    onClick={() => setMenuOpen(false)}
                    className="block px-4 py-3 text-sm text-white hover:bg-white/5"
                  >
                    Sign up
                  </Link>
                )}

                <div className="border-t border-white/10" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-white hover:bg-white/5"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:hidden">
            <NavPill
              to="/collection"
              active={location.pathname === "/collection"}
              onClick={() => setMenuOpen(false)}
            >
              Collection
            </NavPill>

            <NavPill
              to="/admin"
              active={location.pathname === "/admin"}
              accent="admin"
              onClick={() => setMenuOpen(false)}
            >
              Admin
            </NavPill>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;