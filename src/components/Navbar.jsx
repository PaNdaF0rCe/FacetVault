import React from "react";

export default function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">
            FacetVault
          </h1>

          <span className="text-sm text-blue-600 font-medium">
            Collection
          </span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">
            andrew fernando
          </span>

          <button className="bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg">
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}