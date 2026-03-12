import React from "react";

export default function FilterBar({
  search,
  setSearch,
  category,
  setCategory
}) {
  return (
    <div className="panel-surface p-4 mb-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-gray-500">
            Search
          </label>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search gems..."
            className="mt-1 w-full"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-500">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full"
          >
            <option value="">All</option>
            <option value="Gem">Gem</option>
            <option value="Diamond">Diamond</option>
            <option value="Rough">Rough</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>
    </div>
  );
}