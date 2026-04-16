import { Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "Gem", label: "Gem" },
  { value: "Rough", label: "Rough" },
  { value: "Crystal", label: "Crystal" },
  { value: "Other", label: "Other" },
];

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest First" },
  { value: "updatedAt", label: "Recently Updated" },
  { value: "name", label: "Name A–Z" },
  { value: "carat", label: "Carat High–Low" },
  { value: "pricePaid", label: "Price High–Low" },
];

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-white/38">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          className="w-full appearance-none rounded-2xl border border-white/8 bg-[#020617] px-3.5 py-2.5 pr-10 text-sm text-white outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-amber-300/30 focus:bg-[#030a16] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.05)]"
        >
          {options.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/28">
          ▾
        </span>
      </div>
    </div>
  );
}

function MobileSummary({ totalItems, shownCount }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-[#020617]/82 px-3.5 py-3">
      <div>
        <p className="text-sm font-semibold text-white">Refine collection</p>
        <p className="mt-0.5 text-xs text-white/42">
          {shownCount} of {totalItems} stone{totalItems === 1 ? "" : "s"} shown
        </p>
      </div>
    </div>
  );
}

function FilterBar({
  filters,
  onFilterChange,
  totalCount = 0,
  totalItems = 0,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters?.search?.trim()) count += 1;
    if (filters?.category) count += 1;
    if (filters?.sortBy && filters.sortBy !== "createdAt") count += 1;
    return count;
  }, [filters]);

  const updateField = (key, value) => {
    onFilterChange((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetFilters = () => {
    onFilterChange((prev) => ({
      ...prev,
      category: "",
      search: "",
      sortBy: "createdAt",
    }));
  };

  return (
    <>
      <section className="rounded-[24px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.94),rgba(4,12,26,0.96))] p-3.5 shadow-[0_14px_36px_rgba(0,0,0,0.16)] sm:p-4">
        <div className="hidden items-end gap-3 md:grid md:grid-cols-[1.2fr_0.8fr_0.8fr_auto]">
          <div>
            <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.2em] text-white/38">
              Search
            </label>

            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/28">
                <Search size={15} strokeWidth={1.5} />
              </div>

              <input
                type="text"
                value={filters.search || ""}
                onChange={(e) => updateField("search", e.target.value)}
                placeholder="Search name, stone type, code..."
                className="w-full rounded-2xl border border-white/8 bg-[#020617] px-3.5 py-2.5 pl-10 text-sm text-white placeholder:text-white/26 outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-amber-300/30 focus:bg-[#030a16] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.05)]"
              />
            </div>
          </div>

          <SelectField
            label="Category"
            value={filters.category || ""}
            onChange={(e) => updateField("category", e.target.value)}
            options={CATEGORY_OPTIONS}
          />

          <SelectField
            label="Sort By"
            value={filters.sortBy || "createdAt"}
            onChange={(e) => updateField("sortBy", e.target.value)}
            options={SORT_OPTIONS}
          />

          <div className="flex items-center gap-2">
            <div className="hidden rounded-2xl border border-white/8 bg-[#020617]/82 px-3.5 py-2.5 lg:block">
              <p className="text-[10px] uppercase tracking-[0.18em] text-white/34">
                Showing
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {totalCount} / {totalItems}
              </p>
            </div>

            <button
              type="button"
              onClick={resetFilters}
              className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white"
            >
              Reset
            </button>
          </div>
        </div>

        <div className="space-y-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/28">
                <Search size={15} strokeWidth={1.5} />
              </div>

              <input
                type="text"
                value={filters.search || ""}
                onChange={(e) => updateField("search", e.target.value)}
                placeholder="Search collection..."
                className="w-full rounded-2xl border border-white/8 bg-[#020617] px-3.5 py-2.5 pl-10 text-sm text-white placeholder:text-white/26 outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-amber-300/30 focus:bg-[#030a16] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.05)]"
              />
            </div>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/8 bg-white/[0.025] px-3.5 py-2.5 text-sm font-medium text-white/78 transition hover:border-white/14 hover:text-white"
            >
              <SlidersHorizontal size={15} strokeWidth={1.6} />
              Filters
              {activeFiltersCount > 0 && (
                <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-300 px-1.5 text-[10px] font-semibold text-[#09101c]">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          <MobileSummary totalItems={totalItems} shownCount={totalCount} />

          {mobileOpen && (
            <div className="rounded-[22px] border border-white/8 bg-[#020617]/76 p-3.5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Filter options</p>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-white/48 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close filters"
                >
                  <X size={16} strokeWidth={1.8} />
                </button>
              </div>

              <div className="grid gap-3">
                <SelectField
                  label="Category"
                  value={filters.category || ""}
                  onChange={(e) => updateField("category", e.target.value)}
                  options={CATEGORY_OPTIONS}
                />

                <SelectField
                  label="Sort By"
                  value={filters.sortBy || "createdAt"}
                  onChange={(e) => updateField("sortBy", e.target.value)}
                  options={SORT_OPTIONS}
                />

                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-1 rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default FilterBar;