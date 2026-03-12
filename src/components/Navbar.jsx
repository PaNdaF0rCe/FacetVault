import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="min-h-[64px] flex flex-wrap items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-4 sm:gap-8 min-w-0">
            <Link
              to="/dashboard"
              className="text-lg sm:text-2xl font-bold text-gray-900 tracking-tight truncate"
            >
              GFacetVault
            </Link>

            {user && (
              <div className="flex items-center gap-4 sm:gap-6">
                <Link
                  to="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/dashboard')
                      ? 'text-blue-600'
                      : 'text-gray-700 hover:text-blue-600'
                  }`}
                >
                  Collection
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {user ? (
              <>
                <div className="hidden sm:block text-sm text-gray-600 max-w-[180px] truncate">
                  {user.displayName || user.email}
                </div>

                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-gray-300 object-cover"
                  />
                )}

                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 sm:gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;