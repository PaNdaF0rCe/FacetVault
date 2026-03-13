import { useState, useEffect } from "react";

function ActiveChip({ label, onRemove }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-200 transition hover:border-white/20 hover:bg-white/10"
    >
      <span>{label}</span>
      <span className="text-gray-400">✕</span>
    </button>
  );
}

function FilterBar({
  filters,
  onFilterChange,
  totalCount = 0,
  totalItems = 0,
}) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasSearch = !!filters.search?.trim();
  const hasCategory = !!filters.category;
  const hasSort = !!filters.sortBy && filters.sortBy !== "updatedAt";

  const hasActiveFilters = hasSearch || hasCategory || hasSort;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 640) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const clearFilters = () => {
    onFilterChange({
      search: "",
      category: "",
      sortBy: "updatedAt",
    });
  };

  const removeSearch = () => {
    onFilterChange({ ...filters, search: "" });
  };

  const removeCategory = () => {
    onFilterChange({ ...filters, category: "" });
  };

  const removeSort = () => {
    onFilterChange({ ...filters, sortBy: "updatedAt" });
  };

  const getSortLabel = (sortBy) => {
    switch (sortBy) {
      case "createdAt":
        return "Newest";
      case "carat":
        return "Carat";
      case "pricePaid":
        return "Price";
      case "updatedAt":
      default:
        return "Recently Updated";
    }
  };

  const desktopForm = (
    <div className="mt-4 hidden sm:grid sm:grid-cols-1 sm:gap-3 lg:grid-cols-[minmax(0,1.6fr)_minmax(180px,0.8fr)_minmax(180px,0.8fr)]">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Search
        </label>
        <input
          type="text"
          placeholder="Search gems, colors, cuts..."
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
          className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) =>
            onFilterChange({ ...filters, category: e.target.value })
          }
          className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 outline-none transition focus:border-amber-400"
        >
          <option value="">All Categories</option>
          <option value="Gem">Gem</option>
          <option value="Rough">Rough</option>
          <option value="Crystal">Crystal</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFilterChange({ ...filters, sortBy: e.target.value })
          }
          className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 outline-none transition focus:border-amber-400"
        >
          <option value="updatedAt">Recently Updated</option>
          <option value="createdAt">Newest</option>
          <option value="carat">Carat</option>
          <option value="pricePaid">Price</option>
        </select>
      </div>
    </div>
  );

  const mobileForm = isMobileOpen && (
    <div className="mt-4 space-y-3 sm:hidden">
      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Search
        </label>
        <input
          type="text"
          placeholder="Search gems, colors, cuts..."
          value={filters.search}
          onChange={(e) =>
            onFilterChange({ ...filters, search: e.target.value })
          }
          className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-400"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Category
        </label>
        <select
          value={filters.category}
          onChange={(e) =>
            onFilterChange({ ...filters, category: e.target.value })
          }
          className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 outline-none transition focus:border-amber-400"
        >
          <option value="">All Categories</option>
          <option value="Gem">Gem</option>
          <option value="Rough">Rough</option>
          <option value="Crystal">Crystal</option>
          <option value="Other">Other</option>
        </select>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
          Sort by
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) =>
            onFilterChange({ ...filters, sortBy: e.target.value })
          }
          className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 outline-none transition focus:border-amber-400"
        >
          <option value="updatedAt">Recently Updated</option>
          <option value="createdAt">Newest</option>
          <option value="carat">Carat</option>
          <option value="pricePaid">Price</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="w-full rounded-xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-[#020617]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Refine collection</p>
          <p className="text-xs text-gray-400">
            {totalCount} of {totalItems} {totalItems === 1 ? "stone" : "stones"} shown
          </p>
        </div>

        <div className="flex items-center gap-2 sm:hidden">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="rounded-xl border border-[#1e293b] bg-[#071224] px-4 py-2.5 text-sm font-medium text-white transition hover:border-amber-400"
          >
            {isMobileOpen ? "Close" : "Filters"}
          </button>
        </div>

        <div className="hidden sm:block">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {desktopForm}
      {mobileForm}

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hasSearch && (
            <ActiveChip label={`Search: ${filters.search.trim()}`} onRemove={removeSearch} />
          )}
          {hasCategory && (
            <ActiveChip label={`Category: ${filters.category}`} onRemove={removeCategory} />
          )}
          {hasSort && (
            <ActiveChip label={`Sort: ${getSortLabel(filters.sortBy)}`} onRemove={removeSort} />
          )}
        </div>
      )}
    </section>
  );
}

export default FilterBar;