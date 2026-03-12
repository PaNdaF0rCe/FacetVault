import React from "react";

function FilterBar({ filters, onFilterChange }) {
  return (
    <div className="bg-[#020617] border border-[#1e293b] rounded-xl p-4 flex flex-col md:flex-row gap-3">

      {/* Search */}
      <input
        type="text"
        placeholder="Search gems..."
        value={filters.search}
        onChange={(e) =>
          onFilterChange({ ...filters, search: e.target.value })
        }
        className="bg-[#020617] border border-[#1e293b] text-gray-200 placeholder-gray-500 rounded-lg px-3 py-2 focus:border-amber-400 focus:outline-none w-full"
      />

      {/* Category */}
      <select
        value={filters.category}
        onChange={(e) =>
          onFilterChange({ ...filters, category: e.target.value })
        }
        className="bg-[#020617] border border-[#1e293b] text-gray-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:outline-none"
      >
        <option value="">All Categories</option>
        <option value="Gem">Gem</option>
        <option value="Rough">Rough</option>
        <option value="Crystal">Crystal</option>
      </select>

      {/* Sort */}
      <select
        value={filters.sortBy}
        onChange={(e) =>
          onFilterChange({ ...filters, sortBy: e.target.value })
        }
        className="bg-[#020617] border border-[#1e293b] text-gray-200 rounded-lg px-3 py-2 focus:border-amber-400 focus:outline-none"
      >
        <option value="updatedAt">Recently Updated</option>
        <option value="createdAt">Newest</option>
        <option value="carat">Carat</option>
        <option value="pricePaid">Price</option>
      </select>
    </div>
  );
}

export default FilterBar;