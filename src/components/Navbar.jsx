import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isDashboard = location.pathname === "/dashboard";

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
          <button
            onClick={logout}
            className="rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-amber-300 sm:px-5"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}

export default Navbar;