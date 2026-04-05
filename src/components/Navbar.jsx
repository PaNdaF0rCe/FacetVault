import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useRef, useState } from "react";
import logo from "../assets/logo-diamond.png";

function DropdownLink({
  to,
  children,
  onClick,
  active = false,
  accent = "default",
}) {
  const activeClass =
    accent === "admin"
      ? active
        ? "bg-white/5 text-amber-300"
        : "text-amber-300/85 hover:bg-white/5 hover:text-amber-300"
      : active
      ? "bg-white/5 text-white"
      : "text-white/85 hover:bg-white/5 hover:text-white";

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 text-sm transition ${activeClass}`}
    >
      {children}
    </Link>
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
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#020617]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
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

        {!user ? (
          <div className="flex items-center gap-2 sm:gap-3">
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
              to="/about"
              className={`hidden rounded-xl px-3 py-2 text-sm transition md:block ${
                location.pathname === "/about"
                  ? "bg-white/10 text-white"
                  : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
            >
              About
            </Link>

            <Link
              to="/login"
              className="hidden rounded-xl px-3 py-2 text-sm text-white/80 transition hover:bg-white/5 hover:text-white sm:block"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="hidden rounded-xl bg-amber-400 px-4 py-2 text-sm font-semibold text-black transition hover:bg-amber-300 sm:block"
            >
              Sign up
            </Link>

            <Link
              to="/login"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white sm:hidden"
              aria-label="Login"
            >
              👤
            </Link>
          </div>
        ) : (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-2 py-2 transition hover:bg-white/10 sm:gap-3 sm:px-3"
              aria-label="Open account menu"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-400/20 font-semibold text-amber-200 sm:h-9 sm:w-9">
                {userInitial}
              </div>

              <div className="hidden text-left sm:block">
                <p className="max-w-[160px] truncate text-sm text-white">
                  {displaySource}
                </p>
                <p className="text-xs text-white/40">
                  {isAdmin ? "Admin" : "Account"}
                </p>
              </div>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120] shadow-xl">
                <div className="border-b border-white/10 px-4 py-3">
                  <p className="truncate text-sm text-white">{displaySource}</p>
                  <p className="text-xs text-white/40">
                    {isAdmin ? "Admin" : "Account"}
                  </p>
                </div>

                <DropdownLink
                  to="/collection"
                  onClick={closeMenu}
                  active={location.pathname === "/collection"}
                >
                  Collection
                </DropdownLink>

                <DropdownLink
                  to="/about"
                  onClick={closeMenu}
                  active={location.pathname === "/about"}
                >
                  About
                </DropdownLink>

                <DropdownLink
                  to="/how-to-buy"
                  onClick={closeMenu}
                  active={location.pathname === "/how-to-buy"}
                >
                  How to Buy
                </DropdownLink>

                <DropdownLink
                  to="/contact"
                  onClick={closeMenu}
                  active={location.pathname === "/contact"}
                >
                  Contact
                </DropdownLink>

                {isAdmin && (
                  <>
                    <div className="border-t border-white/10" />

                    <DropdownLink
                      to="/admin"
                      onClick={closeMenu}
                      active={location.pathname === "/admin"}
                      accent="admin"
                    >
                      Admin
                    </DropdownLink>
                  </>
                )}

                <div className="border-t border-white/10" />

                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-sm text-white transition hover:bg-white/5"
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