import React from 'react';

function FilterBar({ filters, onFilterChange }) {
  const handleChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">
          Search
        </label>
        <input
          type="text"
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          placeholder="Search gems..."
          className="rounded-lg border border-gray-300 px-3 py-3 sm:py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col">
        <label className="mb-1 text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-3 sm:py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All</option>
          <option value="Gem">Gem</option>
          <option value="Diamond">Diamond</option>
          <option value="Rough">Rough</option>
          <option value="Other">Other</option>
        </select>
      </div>
    </div>
  );
}

export default FilterBar;