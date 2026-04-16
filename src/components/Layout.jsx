import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  const location = useLocation();
  const showNavbar = !["/login", "/signup"].includes(location.pathname);

  return (
    <div className="relative min-h-screen overflow-x-hidden text-gray-100">
      {/* Background Layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-x-clip">
        {/* Base */}
        <div className="absolute inset-0 bg-[#050810]" />

        {/* Top glow */}
        <div className="absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-amber-400/5 blur-3xl" />

        {/* Bottom glow */}
        <div className="absolute bottom-0 left-1/2 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-blue-500/5 blur-3xl" />

        {/* Subtle radial overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,rgba(251,191,36,0.04),transparent_40%)]" />
      </div>

      {/* Navbar */}
      {showNavbar && <Navbar />}

      {/* Main Content */}
      <main className="relative mx-auto w-full max-w-[1400px] overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;