import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const active = (path) =>
    location.pathname === path
      ? 'text-amber-300'
      : 'text-slate-300 hover:text-white';

  return (
    <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-xl font-semibold tracking-wide text-amber-300"
          >
            FacetVault
          </Link>

          <Link to="/dashboard" className={`text-sm font-medium ${active('/dashboard')}`}>
            Collection
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user?.email && (
            <span className="hidden max-w-[220px] truncate text-sm text-slate-300 sm:block">
              {user.email}
            </span>
          )}

          <button
            onClick={logout}
            className="rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-amber-300"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;