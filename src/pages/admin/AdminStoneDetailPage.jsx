import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../../components/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { getDocument } from "../../lib/firebase/db-operations";
import {
  deleteInventoryItem,
  updateInventoryItem,
} from "../../lib/firebase/inventory-operations";
import { updateUserStats } from "../../lib/firebase/users";

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

function DetailField({ label, value, accent = false }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#04101f]/70 p-3">
      <p className="text-[10px] uppercase tracking-[0.16em] text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1.5 text-sm font-medium ${
          accent ? "text-amber-300" : "text-white"
        }`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

function AdminStoneDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [gem, setGem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingSold, setIsTogglingSold] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);

  const loadGem = useCallback(async () => {
    if (!id || !user?.uid) return;

    setIsLoading(true);

    try {
      const item = await getDocument("inventory", id);

      if (item.userId !== user.uid) {
        setToast({
          type: "error",
          title: "Access denied",
          message: "You do not have permission to view this gem.",
        });
        setGem(null);
        return;
      }

      setGem(item);
    } catch (error) {
      console.error("Error loading gem:", error);
      setToast({
        type: "error",
        title: "Load failed",
        message: "Could not load this gem.",
      });
      setGem(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, user?.uid]);

  useEffect(() => {
    loadGem();
  }, [loadGem]);

  const handleDelete = async () => {
    if (!gem?.id || !user?.uid) return;

    try {
      setIsDeleting(true);
      await deleteInventoryItem(gem.id, user.uid);
      await updateUserStats(user.uid);

      setToast({
        type: "success",
        title: "Gem deleted",
        message: "The gem was removed from your collection.",
      });

      window.setTimeout(() => {
        navigate("/admin");
      }, 300);
    } catch (error) {
      console.error("Error deleting gem:", error);
      setToast({
        type: "error",
        title: "Delete failed",
        message: "Failed to delete gem.",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleToggleSold = async () => {
    if (!gem?.id || !user?.uid || isTogglingSold) return;

    try {
      setIsTogglingSold(true);

      await updateInventoryItem(
        gem.id,
        {
          isSold: !gem.isSold,
          isForSale: gem.isSold ? gem.isForSale : false,
        },
        user.uid
      );

      await loadGem();

      setToast({
        type: "success",
        title: gem.isSold ? "Marked available" : "Marked as sold",
        message: gem.isSold
          ? "This gem is available again."
          : "This gem is now marked as sold.",
      });
    } catch (error) {
      console.error("Error toggling sold status:", error);
      setToast({
        type: "error",
        title: "Update failed",
        message: "Could not update sold status.",
      });
    } finally {
      setIsTogglingSold(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <section className="rounded-3xl border border-white/10 bg-[#020617]/90 p-5">
          <div className="h-6 w-48 rounded bg-white/5" />
          <div className="mt-3 h-4 w-32 rounded bg-white/5" />
        </section>
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="h-[280px] rounded-3xl border border-white/10 bg-white/5" />
          <div className="h-[280px] rounded-3xl border border-white/10 bg-white/5" />
        </section>
      </div>
    );
  }

  if (!gem) {
    return (
      <div className="space-y-3">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <section className="rounded-3xl border border-white/10 bg-[#020617]/90 p-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-red-400/80">
            Detail unavailable
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Gem not found
          </h1>
          <p className="mt-3 text-sm text-gray-400">
            This gem could not be loaded or you do not have access to it.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(7,18,36,0.78),rgba(4,14,30,0.72))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.2em] text-amber-400/80">
              Collection entry
            </p>
            <h1 className="mt-1 truncate text-2xl font-semibold text-amber-300 sm:text-3xl">
              {gem.name}
            </h1>
            <p className="mt-1 text-xs text-gray-500">{gem.stoneCode || "—"}</p>

            <div className="mt-2.5 flex flex-wrap gap-2">
              {gem.isForSale && (
                <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-xs font-medium text-black">
                  For Sale
                </span>
              )}
              {gem.isFeatured && (
                <span className="rounded-full bg-amber-400 px-2.5 py-1 text-xs font-medium text-black">
                  Featured
                </span>
              )}
              {gem.isCollectorPiece && (
                <span className="rounded-full bg-purple-400 px-2.5 py-1 text-xs font-medium text-black">
                  Collector
                </span>
              )}
              {gem.isSold && (
                <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white">
                  SOLD
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="rounded-2xl border border-white/10 px-4 py-2.5 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#04101f] shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
            {gem.imageUrl ? (
              <img
                src={gem.imageUrl}
                alt={gem.name}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm text-gray-500">
                No image available
              </div>
            )}
          </div>

          <section className="rounded-[26px] border border-white/10 bg-[#04101f]/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">
                Commercial Summary
              </h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Quick view
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <DetailField
                label="Price Paid"
                value={formatPrice(gem.pricePaid)}
              />
              <DetailField
                label="Sale Price"
                value={gem.isForSale ? formatPrice(gem.salePrice) : "Not listed"}
                accent={gem.isForSale}
              />
              <DetailField
                label="Quantity"
                value={String(gem.quantity || 1)}
              />
              <DetailField
                label="Status"
                value={
                  gem.isSold
                    ? "Sold"
                    : gem.isForSale
                    ? "Listed"
                    : "Private"
                }
                accent={gem.isSold || gem.isForSale}
              />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-[26px] border border-white/10 bg-[#04101f]/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Stone Details</h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Identification
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <DetailField label="Stone Type" value={gem.stoneType || "—"} />
              <DetailField label="Category" value={gem.category || "—"} />
              <DetailField label="Carat" value={formatCarat(gem.carat)} />
              <DetailField label="Color" value={gem.color || "—"} />
              <DetailField label="Cut" value={gem.cut || "—"} />
              <DetailField label="Origin" value={gem.origin || "—"} />
            </div>
          </section>

          <section className="rounded-[26px] border border-white/10 bg-[#04101f]/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Timeline</h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Record history
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <DetailField label="Created" value={formatDate(gem.createdAt)} />
              <DetailField
                label="Last Updated"
                value={formatDate(gem.updatedAt)}
              />
            </div>
          </section>

          <section className="rounded-[26px] border border-white/10 bg-[#04101f]/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Notes</h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-gray-500">
                Internal
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-white/10 bg-[#020617] p-3.5 text-sm leading-6 text-gray-300">
              {gem.notes || "No notes added"}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#04101f]/70 p-4">
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => navigate(`/admin/edit/${gem.id}`)}
                disabled={isDeleting || isTogglingSold}
                className="w-full rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15 disabled:opacity-50"
              >
                Edit Gem
              </button>

              <button
                type="button"
                onClick={handleToggleSold}
                disabled={isDeleting || isTogglingSold}
                className={`w-full rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:opacity-50 ${
                  gem.isSold
                    ? "bg-emerald-400 text-black hover:bg-emerald-300"
                    : "bg-red-500 text-white hover:bg-red-400"
                }`}
              >
                {isTogglingSold
                  ? "Updating..."
                  : gem.isSold
                  ? "Mark Available"
                  : "Mark Sold"}
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm((prev) => !prev)}
                disabled={isDeleting || isTogglingSold}
                className="w-full rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
              >
                {showDeleteConfirm ? "Cancel Delete" : "Delete Gem"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/admin")}
                disabled={isDeleting || isTogglingSold}
                className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-3 rounded-2xl border border-red-400/20 bg-red-500/10 p-4">
                <p className="text-sm font-semibold text-white">
                  Delete this gem?
                </p>
                <p className="mt-1.5 text-sm text-red-100/90">
                  This action cannot be undone.
                </p>

                <div className="mt-3 flex flex-col gap-2.5 sm:flex-row">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="rounded-2xl bg-red-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Yes, Delete Gem"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white disabled:opacity-50"
                  >
                    Keep Gem
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default AdminStoneDetailPage;