import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Toast from "../../components/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { getDocument } from "../../lib/firebase/db-operations";
import {
  deleteInventoryItem,
  updateInventoryItem,
  markItemAsSold,
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
    <div className="rounded-2xl border border-white/8 bg-[#020617]/72 p-3">
      <p className="text-[10px] uppercase tracking-[0.18em] text-white/36">
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
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [sellingPrice, setSellingPrice] = useState("");
  const [expenses, setExpenses] = useState("");
  const [notes, setNotes] = useState("");
  const [sellingLoading, setSellingLoading] = useState(false);

  const loadGem = useCallback(async () => {
    if (!id || !user?.uid) return;

    setIsLoading(true);

    try {
      const item = await getDocument("inventory", id);

      if (!item) {
        setToast({
          type: "error",
          title: "Not found",
          message: "This gem could not be found.",
        });
        setGem(null);
        return;
      }

      if (item.userId !== user?.uid) {
        setToast({
          type: "error",
          title: "Access denied",
          message: "You do not have permission to view this gem.",
        });
        setGem(null);
        return;
      }

      // 🔥 THIS WAS MISSING — CRITICAL
      setGem(item);

    } catch (error) {
      console.error("Error loading gem:", error);

      setToast({
        type: "error",
        title: "Load failed",
        message: "Failed to load this gem.",
      });

      setGem(null);
    } finally {
      setIsLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    loadGem();
  }, [loadGem]);

  const handleDelete = async () => {
    if (!gem?.id || !user?.uid) return;

    try {
      setIsDeleting(true);

      await deleteInventoryItem(gem.id, user.uid);

      setToast({
        type: "success",
        title: "Deleted",
        message: "Gem deleted successfully.",
      });

      navigate("/admin");
    } catch (error) {
      console.error("Error deleting gem:", error);

      setToast({
        type: "error",
        title: "Delete failed",
        message: "Could not delete this gem.",
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

    const handleMarkAsSold = async () => {
      if (!gem?.id || !user?.uid || sellingLoading) return;
      if (!sellingPrice) {
        setToast({
          type: "error",
          title: "Missing price",
          message: "Enter the selling price first.",
        });
        return;
      }

      try {
        setSellingLoading(true);

        await markItemAsSold(
          gem.id,
          {
            sellingPrice: Number(sellingPrice),
            expenses: Number(expenses || 0),
            notes,
          },
          user.uid
        );

        await loadGem();

        setShowSoldModal(false);
        setSellingPrice("");
        setExpenses("");
        setNotes("");

        setToast({
          type: "success",
          title: "Marked as sold",
          message: "This gem will stay visible as sold for 7 days.",
        });
      } catch (error) {
        console.error("Error marking gem as sold:", error);
        setToast({
          type: "error",
          title: "Sale failed",
          message: "Could not mark this gem as sold.",
        });
      } finally {
        setSellingLoading(false);
      }
    };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,18,36,0.76),rgba(4,12,26,0.74))] p-5">
          <div className="h-6 w-48 rounded bg-white/[0.05]" />
          <div className="mt-3 h-4 w-32 rounded bg-white/[0.05]" />
        </section>
        <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="h-[280px] rounded-[28px] border border-white/8 bg-white/[0.04]" />
          <div className="h-[280px] rounded-[28px] border border-white/8 bg-white/[0.04]" />
        </section>
      </div>
    );
  }

  if (!gem) {
    return (
      <div className="space-y-3">
        <Toast toast={toast} onClose={() => setToast(null)} />
        <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.96),rgba(4,12,26,0.97))] p-6 text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-red-400/80">
            Detail unavailable
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-white">
            Gem not found
          </h1>
          <p className="mt-3 text-sm text-white/45">
            This gem could not be loaded or you do not have access to it.
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,18,36,0.76),rgba(4,12,26,0.74))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.28em] text-amber-300/72">
              Collection entry
            </p>
            <h1 className="mt-2 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {gem.name}
            </h1>
            <p className="mt-1.5 text-xs text-white/34">{gem.stoneCode || "—"}</p>

            <div className="mt-3 flex flex-wrap gap-2">
              {gem.isForSale && (
                <span className="rounded-full bg-emerald-300 px-2.5 py-1 text-xs font-medium text-[#09101c]">
                  For Sale
                </span>
              )}
              {gem.isFeatured && (
                <span className="rounded-full bg-amber-300 px-2.5 py-1 text-xs font-medium text-[#09101c]">
                  Featured
                </span>
              )}
              {gem.isCollectorPiece && (
                <span className="rounded-full bg-purple-300 px-2.5 py-1 text-xs font-medium text-[#09101c]">
                  Collector
                </span>
              )}
              {gem.isSold && (
                <span className="rounded-full bg-red-500 px-2.5 py-1 text-xs font-medium text-white">
                  Sold
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white"
          >
            Back to Dashboard
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
        <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <div className="overflow-hidden rounded-[28px] border border-white/8 bg-[#04101f] shadow-[0_14px_40px_rgba(0,0,0,0.24)]">
            {gem.imageUrl ? (
              <img
                src={gem.imageUrl}
                alt={gem.name}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center text-sm text-white/30">
                No image available
              </div>
            )}
          </div>

          <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">
                Commercial Summary
              </h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/32">
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
          <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Stone Details</h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/32">
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

          <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Timeline</h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/32">
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

          <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-white">Notes</h3>
              <span className="text-[10px] uppercase tracking-[0.16em] text-white/32">
                Internal
              </span>
            </div>

            <div className="mt-3 rounded-2xl border border-white/8 bg-[#020617] p-3.5 text-sm leading-6 text-white/68">
              {gem.notes || "No notes added"}
            </div>
          </section>

          <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              <button
                type="button"
                onClick={() => navigate(`/admin/edit/${gem.id}`)}
                disabled={isDeleting || isTogglingSold}
                className="w-full rounded-2xl border border-amber-300/18 bg-amber-300/8 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-300/12 disabled:opacity-50"
              >
                Edit Gem
              </button>

              {!gem.isSold ? (
                <button
                  type="button"
                  onClick={() => setShowSoldModal(true)}
                  disabled={isDeleting || isTogglingSold}
                  className="w-full rounded-2xl bg-emerald-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400 disabled:opacity-50"
                >
                  Mark as Sold
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleToggleSold}
                  disabled={isDeleting || isTogglingSold}
                  className="w-full rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-amber-400 disabled:opacity-50"
                >
                  {isTogglingSold ? "Updating..." : "Mark Available"}
                </button>
              )}

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
                className="w-full rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-3 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white disabled:opacity-50"
              >
                Close
              </button>
            </div>

            {showDeleteConfirm && (
              <div className="mt-3 rounded-2xl border border-red-400/18 bg-red-500/10 p-4">
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
                    className="rounded-2xl border border-white/8 bg-white/[0.025] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white disabled:opacity-50"
                  >
                    Keep Gem
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      {showSoldModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#020617] p-5 shadow-2xl">
            <h2 className="mb-4 text-lg font-semibold text-white">Mark as Sold</h2>

            <div className="space-y-3">
              <input
                type="number"
                placeholder="Selling Price"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none"
              />

              <input
                type="number"
                placeholder="Expenses (optional)"
                value={expenses}
                onChange={(e) => setExpenses(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none"
              />

              <textarea
                placeholder="Notes (optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-white outline-none"
              />
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowSoldModal(false)}
                disabled={sellingLoading}
                className="flex-1 rounded-xl border border-white/10 py-2 text-sm text-white"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleMarkAsSold}
                disabled={sellingLoading}
                className="flex-1 rounded-xl bg-emerald-500 py-2 text-sm font-medium text-white"
              >
                {sellingLoading ? "Saving..." : "Confirm Sale"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminStoneDetailPage;