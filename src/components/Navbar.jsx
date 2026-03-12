import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isDashboard = location.pathname === "/dashboard";

  return (
    <header className="w-full border-b border-white/10 bg-[#050a16]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">

        {/* Logo */}
        <Link
          to={user ? "/dashboard" : "/"}
          className="text-lg font-semibold tracking-wide text-amber-400"
        >
          FacetVault
        </Link>

        {/* Right side */}
        {user && isDashboard && (
          <button
            onClick={logout}
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-medium text-black transition hover:bg-amber-300"
          >
            Logout
          </button>
        )}

      </div>
    </header>
  );
}

export default Navbar;