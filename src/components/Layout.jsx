import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

function Layout() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100">
      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;