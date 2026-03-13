import { useState, useEffect } from "react";

function FilterBar({ filters, onFilterChange, totalCount = 0 }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const hasActiveFilters =
    !!filters.search?.trim() ||
    !!filters.category ||
    (filters.sortBy && filters.sortBy !== "updatedAt");

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

  return (
    <section className="rounded-2xl border border-white/10 bg-[#020617]/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white">Refine collection</p>
          <p className="text-xs text-gray-400">
            {totalCount} {totalCount === 1 ? "stone" : "stones"} shown
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
      </div>

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

      {isMobileOpen && (
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
      )}
    </section>
  );
}

export default FilterBar;