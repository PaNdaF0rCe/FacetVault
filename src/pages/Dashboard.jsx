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
    await deleteInventoryItem(itemId, user.uid);
    setSelectedGem(null);
    await updateUserStats(user.uid);
    fetchGems();
  };

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    await updateUserStats(user.uid);
    fetchGems();
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-amber-300">
          My Gem Collection
        </h1>

        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-amber-400 text-black px-4 py-2 rounded-lg font-medium hover:bg-amber-300 transition"
        >
          Add New Gem
        </button>
      </div>

      {/* Filter Bar */}
      <FilterBar filters={filters} onFilterChange={setFilters} />

      {/* Loading */}
      {isLoading ? (
        <div className="text-gray-400">Loading collection...</div>
      ) : gems.length === 0 ? (
        <div className="text-gray-400">No gems in collection yet.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {gems.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onClick={setSelectedGem}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <InventoryUploadModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={handleUploadSuccess}
          userId={user.uid}
        />
      )}

      {/* Gem Detail Modal */}
      {selectedGem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">

          <div className="bg-[#020617] border border-[#1e293b] text-gray-200 rounded-2xl shadow-xl max-w-3xl w-full p-6">

            {/* Title */}
            <div className="flex justify-between items-center mb-6">
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

            <div className="grid md:grid-cols-2 gap-6">

              {/* Image */}
              <img
                src={selectedGem.imageUrl}
                alt={selectedGem.name}
                className="rounded-xl border border-[#1e293b]"
              />

              {/* Details */}
              <div className="space-y-3 text-sm">

                <div>
                  <p className="text-gray-400 text-xs">Stone Type</p>
                  <p>{selectedGem.stoneType}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Category</p>
                  <p>{selectedGem.category}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Carat</p>
                  <p>{selectedGem.carat} ct</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Color</p>
                  <p>{selectedGem.color}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Cut</p>
                  <p>{selectedGem.cut}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Origin</p>
                  <p>{selectedGem.origin}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Price Paid</p>
                  <p>{selectedGem.pricePaid}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Quantity</p>
                  <p>{selectedGem.quantity}</p>
                </div>

                <div>
                  <p className="text-gray-400 text-xs">Notes</p>
                  <div className="bg-[#020617] border border-[#1e293b] rounded-lg p-3 text-sm">
                    {selectedGem.notes || "No notes"}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between mt-6">

              <button
                onClick={() => handleGemDelete(selectedGem.id)}
                className="bg-red-500 px-4 py-2 rounded-md text-white hover:bg-red-400"
              >
                Delete Gem
              </button>

              <button
                onClick={() => setSelectedGem(null)}
                className="border border-gray-600 px-4 py-2 rounded-md hover:border-gray-400"
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