import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import FilterBar from "../components/FilterBar";
import InventoryItemCard from "../components/InventoryItemCard";
import InventoryUploadModal from "../components/InventoryUploadModal";
import {
  getFilteredInventory,
  deleteInventoryItem,
} from "../lib/firebase/inventory-operations";
import { updateUserStats } from "../lib/firebase/users";

function Dashboard() {
  const { user } = useAuth();
  const [gems, setGems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedGem, setSelectedGem] = useState(null);

  const [filters, setFilters] = useState({
    category: "",
    search: "",
    sortBy: "updatedAt",
  });

  useEffect(() => {
    if (!user?.uid) return;
    fetchGems();
  }, [user, filters]);

  const fetchGems = async () => {
    setIsLoading(true);
    try {
      const items = await getFilteredInventory(user.uid, filters);
      setGems(items);
    } catch (error) {
      console.error("Error fetching gems:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGemDelete = async (itemId) => {
    try {
      await deleteInventoryItem(itemId, user.uid);
      setSelectedGem(null);
      await updateUserStats(user.uid);
      await fetchGems();
    } catch (error) {
      console.error("Error deleting gem:", error);
      alert("Failed to delete gem.");
    }
  };

  const handleUploadSuccess = async () => {
    try {
      setShowUploadModal(false);
      await updateUserStats(user.uid);
      await fetchGems();
      alert("Gem saved successfully.");
    } catch (error) {
      console.error("Error refreshing after upload:", error);
      setShowUploadModal(false);
      await fetchGems();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-amber-300">
          My Gem Collection
        </h1>

        <button
          onClick={() => setShowUploadModal(true)}
          className="rounded-lg bg-amber-400 px-4 py-2 font-medium text-black transition hover:bg-amber-300"
        >
          Add New Gem
        </button>
      </div>

      <FilterBar filters={filters} onFilterChange={setFilters} />

      {isLoading ? (
        <div className="text-gray-400">Loading collection...</div>
      ) : gems.length === 0 ? (
        <div className="text-gray-400">No gems in collection yet.</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {gems.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onClick={setSelectedGem}
            />
          ))}
        </div>
      )}

      {showUploadModal && (
        <InventoryUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          userId={user.uid}
        />
      )}

      {selectedGem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="w-full max-w-3xl rounded-2xl border border-[#1e293b] bg-[#020617] p-6 text-gray-200 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-amber-300">
                {selectedGem.name}
              </h2>

              <button
                onClick={() => setSelectedGem(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <img
                src={selectedGem.imageUrl}
                alt={selectedGem.name}
                className="rounded-xl border border-[#1e293b]"
              />

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-gray-400">Stone Type</p>
                  <p>{selectedGem.stoneType}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p>{selectedGem.category}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Carat</p>
                  <p>{selectedGem.carat ? `${selectedGem.carat} ct` : "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Color</p>
                  <p>{selectedGem.color || "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Cut</p>
                  <p>{selectedGem.cut || "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Origin</p>
                  <p>{selectedGem.origin || "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Price Paid</p>
                  <p>{selectedGem.pricePaid ?? "—"}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Quantity</p>
                  <p>{selectedGem.quantity}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Notes</p>
                  <div className="rounded-lg border border-[#1e293b] bg-[#020617] p-3 text-sm">
                    {selectedGem.notes || "No notes"}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-between">
              <button
                onClick={() => handleGemDelete(selectedGem.id)}
                className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-400"
              >
                Delete Gem
              </button>

              <button
                onClick={() => setSelectedGem(null)}
                className="rounded-md border border-gray-600 px-4 py-2 hover:border-gray-400"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;