import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import FilterBar from "../components/FilterBar";
import InventoryItemCard from "../components/InventoryItemCard";
import InventoryUploadModal from "../components/InventoryUploadModal";
import Toast from "../components/Toast";
import {
  getFilteredInventory,
  deleteInventoryItem,
} from "../lib/firebase/inventory-operations";
import { updateUserStats } from "../lib/firebase/users";

function formatCarat(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";

  return `${num
    .toFixed(2)
    .replace(/\.00$/, "")
    .replace(/(\.\d)0$/, "$1")} ct`;
}

function formatPrice(value) {
  if (value === null || value === undefined || value === "") return "—";
  const num = Number(value);
  if (Number.isNaN(num)) return "—";
  return `LKR ${num.toLocaleString()}`;
}

function formatDate(value) {
  if (!value) return "—";

  let date = value;

  if (typeof value?.toDate === "function") {
    date = value.toDate();
  } else if (!(value instanceof Date)) {
    date = new Date(value);
  }

  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.14em] text-gray-400">
        {label}
      </p>
      <p className="mt-1 text-sm text-white">{value || "—"}</p>
    </div>
  );
}

function DeleteConfirmModal({
  gemName,
  onCancel,
  onConfirm,
  isDeleting = false,
}) {
  const handleBackdropClick = () => {
    if (!isDeleting) onCancel();
  };

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && !isDeleting) {
        onCancel();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isDeleting, onCancel]);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-[1px]"
      onClick={handleBackdropClick}
    >
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-3xl border border-white/10 bg-[#020617] p-5 text-gray-200 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-red-400/80">
              Confirm deletion
            </p>
            <h2 className="mt-1 text-xl font-semibold text-white">
              Delete this gem?
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-400">
              This will permanently remove{" "}
              <span className="font-medium text-gray-200">{gemName}</span> from
              your collection.
            </p>
          </div>

          <div className="rounded-2xl border border-red-400/15 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            This action cannot be undone.
          </div>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Gem"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyCollectionState({ onAddGem }) {
  return (
    <section className="overflow-hidden rounded-3xl border border-white/10 bg-[#020617]/90 shadow-[0_18px_50px_rgba(0,0,0,0.2)]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(251,191,36,0.10),transparent_45%),linear-gradient(180deg,rgba(7,18,36,0.95),rgba(2,6,23,0.96))] px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-2xl text-amber-300 shadow-[0_10px_30px_rgba(251,191,36,0.08)]">
            ◇
          </div>

          <p className="mt-5 text-xs font-medium uppercase tracking-[0.22em] text-amber-400/80">
            Start your vault
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Your collection is empty
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
            Add your first gem to begin organizing your personal inventory with
            photos, stone details, pricing, and notes.
          </p>

          <button
            type="button"
            onClick={onAddGem}
            className="mt-6 inline-flex items-center justify-center rounded-2xl bg-amber-400 px-6 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-amber-300"
          >
            Add Your First Gem
          </button>
        </div>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-3 sm:px-8 sm:py-6">
        <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4">
          <p className="text-sm font-semibold text-white">Track details</p>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Save stone type, cut, origin, carat weight, quantity, and collection
            notes in one place.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4">
          <p className="text-sm font-semibold text-white">Keep clear photos</p>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Attach an image to each entry so your collection stays easier to
            browse and identify.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4">
          <p className="text-sm font-semibold text-white">Stay organized</p>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Filter and sort entries as your collection grows without losing
            track of what you own.
          </p>
        </div>
      </div>
    </section>
  );
}

function StatCard({ label, value, hint }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4">
      <p className="text-xs font-medium uppercase tracking-[0.18em] text-gray-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {hint && <p className="mt-1 text-sm text-gray-400">{hint}</p>}
    </div>
  );
}

function MobileSummaryBar({ totalEntries, totalCarats, totalValue }) {
  return (
    <section className="rounded-2xl border border-white/10 bg-[#04101f]/75 px-3 py-3 sm:hidden">
      <div className="grid grid-cols-3 divide-x divide-white/10 text-center">
        <div className="px-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
            Gems
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {totalEntries.toLocaleString()}
          </p>
        </div>

        <div className="px-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
            Carats
          </p>
          <p className="mt-1 text-sm font-semibold text-white">
            {formatCarat(totalCarats)}
          </p>
        </div>

        <div className="px-2">
          <p className="text-[10px] uppercase tracking-[0.18em] text-gray-400">
            Value
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-white">
            {formatPrice(totalValue)}
          </p>
        </div>
      </div>
    </section>
  );
}

function LoadingSkeletons() {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-2xl border border-white/8 bg-[#020617]/95 p-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-xl bg-white/5 sm:h-24 sm:w-24" />
            <div className="min-w-0 flex-1">
              <div className="h-5 w-2/3 rounded bg-white/5" />
              <div className="mt-3 h-4 w-1/3 rounded bg-white/5" />
              <div className="mt-4 flex gap-2">
                <div className="h-6 w-16 rounded-full bg-white/5" />
                <div className="h-6 w-14 rounded-full bg-white/5" />
                <div className="h-6 w-20 rounded-full bg-white/5" />
              </div>
              <div className="mt-4 h-4 w-full rounded bg-white/5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function GemDetailModal({
  gem,
  isRefreshing,
  isBusy,
  onClose,
  onEdit,
  onDelete,
}) {
  useEffect(() => {
    if (!gem) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape" && !isBusy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [gem, isBusy, onClose]);

  if (!gem) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-[1px]"
      onClick={() => {
        if (!isBusy) onClose();
      }}
    >
      <div className="flex min-h-full items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
        <div
          key={gem.id}
          className="my-3 flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[#1e293b] bg-[#020617] text-gray-200 shadow-[0_24px_60px_rgba(0,0,0,0.4)] sm:max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 border-b border-[#1e293b] bg-[#061224]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-400/80">
                  Collection entry
                </p>
                <h2 className="mt-1 text-xl font-semibold text-amber-300 sm:text-2xl">
                  {gem.name}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Review the saved gem details and manage this entry.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close gem details"
                disabled={isBusy}
              >
                ✕
              </button>
            </div>
          </div>

          <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <div className="relative">
              {isRefreshing && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-[#020617]/70 backdrop-blur-[2px]">
                  <div className="rounded-2xl border border-white/10 bg-[#091427]/95 px-5 py-4 text-sm text-white shadow-lg">
                    Saving changes...
                  </div>
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                <div className="space-y-5">
                  <div className="overflow-hidden rounded-2xl border border-[#1e293b] bg-[#04101f]">
                    <div className="aspect-square w-full bg-[#04101f]">
                      <img
                        src={gem.imageUrl}
                        alt={gem.name}
                        className="h-full w-full object-cover"
                        loading="eager"
                        decoding="async"
                        fetchPriority="high"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    </div>
                  </div>

                  <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-white">
                      Quick summary
                    </h3>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs">
                      {gem.stoneType && (
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-gray-300">
                          {gem.stoneType}
                        </span>
                      )}
                      {gem.category && (
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-gray-300">
                          {gem.category}
                        </span>
                      )}
                      {gem.color && (
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-gray-300">
                          {gem.color}
                        </span>
                      )}
                      {gem.cut && (
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-gray-300">
                          {gem.cut}
                        </span>
                      )}
                      {gem.origin && (
                        <span className="rounded-full border border-white/10 px-3 py-1.5 text-gray-300">
                          {gem.origin}
                        </span>
                      )}
                    </div>
                  </section>
                </div>

                <div className="space-y-5">
                  <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-white">Details</h3>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <DetailField label="Stone Type" value={gem.stoneType} />
                      <DetailField label="Category" value={gem.category} />
                      <DetailField label="Carat" value={formatCarat(gem.carat)} />
                      <DetailField label="Color" value={gem.color || "—"} />
                      <DetailField label="Cut" value={gem.cut || "—"} />
                      <DetailField label="Origin" value={gem.origin || "—"} />
                      <DetailField
                        label="Price Paid"
                        value={formatPrice(gem.pricePaid)}
                      />
                      <DetailField
                        label="Quantity"
                        value={String(gem.quantity || "—")}
                      />
                      <DetailField
                        label="Created"
                        value={formatDate(gem.createdAt)}
                      />
                      <DetailField
                        label="Last Updated"
                        value={formatDate(gem.updatedAt)}
                      />
                    </div>
                  </section>

                  <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-white">Notes</h3>
                    <div className="mt-3 break-words rounded-xl border border-[#1e293b] bg-[#020617] p-4 text-sm leading-6 text-gray-300">
                      {gem.notes || "No notes"}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 border-t border-[#1e293b] bg-[#061224]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={onEdit}
                  disabled={isBusy}
                  className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-5 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Edit Gem
                </button>

                <button
                  onClick={onDelete}
                  disabled={isBusy}
                  className="rounded-xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Delete Gem
                </button>
              </div>

              <button
                onClick={onClose}
                disabled={isBusy}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const [gems, setGems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedGem, setSelectedGem] = useState(null);
  const [editingGem, setEditingGem] = useState(null);
  const [isRefreshingSelectedGem, setIsRefreshingSelectedGem] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingGem, setIsDeletingGem] = useState(false);
  const [toast, setToast] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sortBy: "createdAt",
  });

  const showToast = useCallback((nextToast) => {
    setToast(null);
    window.setTimeout(() => {
      setToast(nextToast);
    }, 10);
  }, []);

  const fetchGems = useCallback(async () => {
    if (!user?.uid) return;

    setIsLoading(true);
    try {
      const items = await getFilteredInventory(user.uid, filters);
      setGems(items);
    } catch (error) {
      console.error("Error fetching gems:", error);
      showToast({
        type: "error",
        title: "Load failed",
        message: "Could not load your collection.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid, filters, showToast]);

  useEffect(() => {
    fetchGems();
  }, [fetchGems]);

  useEffect(() => {
    if (!showUploadModal && !editingGem && !selectedGem && !showDeleteConfirm) {
      document.body.style.overflow = "";
    }
  }, [showUploadModal, editingGem, selectedGem, showDeleteConfirm]);

  const totalEntries = useMemo(() => {
    return gems.reduce((sum, item) => {
      const qty = Number(item.quantity);
      return sum + (Number.isNaN(qty) ? 1 : qty || 1);
    }, 0);
  }, [gems]);

  const totalCarats = useMemo(() => {
    return gems.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const carat = Number(item.carat);
      const safeQty = Number.isNaN(qty) ? 1 : qty || 1;
      const safeCarat = Number.isNaN(carat) ? 0 : carat || 0;
      return sum + safeCarat * safeQty;
    }, 0);
  }, [gems]);

  const totalValue = useMemo(() => {
    return gems.reduce((sum, item) => {
      const qty = Number(item.quantity);
      const price = Number(item.pricePaid);
      const safeQty = Number.isNaN(qty) ? 1 : qty || 1;
      const safePrice = Number.isNaN(price) ? 0 : price || 0;
      return sum + safePrice * safeQty;
    }, 0);
  }, [gems]);

  const detailModalBusy =
    !!editingGem ||
    isRefreshingSelectedGem ||
    showDeleteConfirm ||
    isDeletingGem;

  const handleOpenGem = useCallback((gem) => {
    setEditingGem(null);
    setShowDeleteConfirm(false);
    setSelectedGem(gem);
  }, []);

  const handleCloseSelectedGem = useCallback(() => {
    if (detailModalBusy) return;
    setSelectedGem(null);
  }, [detailModalBusy]);

  const handleRequestDelete = useCallback(() => {
    if (!selectedGem || detailModalBusy) return;
    setShowDeleteConfirm(true);
  }, [selectedGem, detailModalBusy]);

  const handleCancelDelete = useCallback(() => {
    if (isDeletingGem) return;
    setShowDeleteConfirm(false);
  }, [isDeletingGem]);

  const handleConfirmDelete = useCallback(async () => {
    if (!selectedGem?.id || !user?.uid) return;

    try {
      setIsDeletingGem(true);

      await deleteInventoryItem(selectedGem.id, user.uid);
      await updateUserStats(user.uid);

      const refreshedItems = await getFilteredInventory(user.uid, filters);
      setGems(refreshedItems);

      setShowDeleteConfirm(false);
      setSelectedGem(null);
      setEditingGem(null);

      showToast({
        type: "success",
        title: "Gem deleted",
        message: "The gem was removed from your collection.",
      });
    } catch (error) {
      console.error("Error deleting gem:", error);
      showToast({
        type: "error",
        title: "Delete failed",
        message: "Failed to delete gem.",
      });
    } finally {
      setIsDeletingGem(false);
    }
  }, [selectedGem, user?.uid, filters, showToast]);

  const handleUploadSuccess = useCallback(async () => {
    try {
      setShowUploadModal(false);
      await updateUserStats(user.uid);
      await fetchGems();

      showToast({
        type: "success",
        title: "Gem saved",
        message: "Your new gem was added to the collection.",
      });
    } catch (error) {
      console.error("Error refreshing after upload:", error);
      setShowUploadModal(false);
      await fetchGems();
    }
  }, [user?.uid, fetchGems, showToast]);

  const handleStartEdit = useCallback(() => {
    if (!selectedGem || detailModalBusy) return;
    setEditingGem(selectedGem);
  }, [selectedGem, detailModalBusy]);

  const handleEditSuccess = useCallback(async () => {
    try {
      const editedId = editingGem?.id || selectedGem?.id;

      setEditingGem(null);
      setIsRefreshingSelectedGem(true);

      await updateUserStats(user.uid);

      const refreshedItems = await getFilteredInventory(user.uid, filters);
      setGems(refreshedItems);

      if (editedId) {
        const refreshedGem =
          refreshedItems.find((item) => item.id === editedId) || null;
        setSelectedGem(refreshedGem);
      }

      showToast({
        type: "success",
        title: "Gem updated",
        message: "Your changes were saved successfully.",
      });
    } catch (error) {
      console.error("Error refreshing after edit:", error);
      showToast({
        type: "error",
        title: "Update refresh failed",
        message: "The gem was updated, but the view did not refresh cleanly.",
      });
      await fetchGems();
    } finally {
      setIsRefreshingSelectedGem(false);
    }
  }, [editingGem, selectedGem, user?.uid, filters, showToast, fetchGems]);

  return (
    <div className="space-y-4 sm:space-y-5 lg:space-y-6">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-5 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-amber-400/80 sm:text-xs">
              Personal inventory
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-amber-300 sm:text-4xl">
              My Gem Collection
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-400 sm:text-base">
              Manage your stones, review details quickly, and keep your
              collection organized in one place.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center justify-center rounded-2xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black shadow-sm transition hover:bg-amber-300 sm:self-start lg:self-auto"
          >
            Add New Gem
          </button>
        </div>
      </section>

      {!isLoading && gems.length > 0 && (
        <>
          <MobileSummaryBar
            totalEntries={totalEntries}
            totalCarats={totalCarats}
            totalValue={totalValue}
          />

          <section className="hidden grid-cols-1 gap-4 sm:grid sm:grid-cols-3">
            <StatCard
              label="Total Entries"
              value={totalEntries.toLocaleString()}
              hint="Across your current filtered view"
            />
            <StatCard
              label="Total Carats"
              value={formatCarat(totalCarats)}
              hint="Combined carat weight"
            />
            <StatCard
              label="Total Value"
              value={formatPrice(totalValue)}
              hint="Based on recorded price paid"
            />
          </section>
        </>
      )}

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        totalCount={gems.length}
        totalItems={gems.length}
      />

      {isLoading ? (
        <LoadingSkeletons />
      ) : gems.length === 0 ? (
        <EmptyCollectionState onAddGem={() => setShowUploadModal(true)} />
      ) : (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2 2xl:grid-cols-3">
          {gems.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onClick={handleOpenGem}
            />
          ))}
        </div>
      )}

      {showUploadModal && (
        <InventoryUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          userId={user.uid}
          mode="create"
          onNotify={showToast}
        />
      )}

      {selectedGem && (
        <GemDetailModal
          key={selectedGem.id}
          gem={selectedGem}
          isRefreshing={isRefreshingSelectedGem}
          isBusy={detailModalBusy}
          onClose={handleCloseSelectedGem}
          onEdit={handleStartEdit}
          onDelete={handleRequestDelete}
        />
      )}

      {editingGem && (
        <InventoryUploadModal
          key={`edit-${editingGem.id}`}
          onClose={() => setEditingGem(null)}
          onSuccess={handleEditSuccess}
          userId={user.uid}
          mode="edit"
          initialData={editingGem}
          onNotify={showToast}
        />
      )}

      {showDeleteConfirm && selectedGem && (
        <DeleteConfirmModal
          gemName={selectedGem.name}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isDeleting={isDeletingGem}
        />
      )}
    </div>
  );
}

export default Dashboard;