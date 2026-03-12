import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-[#020617] border-b border-[#1e293b]">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">

        <Link
          to="/dashboard"
          className="text-lg font-semibold tracking-wide text-amber-300"
        >
          FacetVault
        </Link>

        <div className="flex items-center gap-4 text-sm">

          {user && (
            <span className="text-gray-400">
              {user.email}
            </span>
          )}

          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-md bg-amber-400 text-black font-medium hover:bg-amber-300 transition"
          >
            Logout
          </button>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;