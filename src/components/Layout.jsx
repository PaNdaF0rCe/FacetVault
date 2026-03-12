import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f8f9fd] to-[#eef1f7]">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;