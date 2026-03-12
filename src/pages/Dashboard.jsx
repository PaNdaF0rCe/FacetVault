import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FilterBar from '../components/FilterBar';
import InventoryItemCard from '../components/InventoryItemCard';
import InventoryUploadModal from '../components/InventoryUploadModal';
import { getFilteredInventory, deleteInventoryItem } from '../lib/firebase/inventory-operations';
import { updateUserStats } from '../lib/firebase/users';

function Dashboard() {
  const { user } = useAuth();
  const [gems, setGems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    sortBy: 'updatedAt'
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
      console.error('Error fetching gems:', error);
      alert('Failed to fetch gem records');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGemDelete = async (itemId) => {
    try {
      await deleteInventoryItem(itemId, user.uid);
      await updateUserStats(user.uid);
      fetchGems();
    } catch (error) {
      console.error('Error deleting gem:', error);
      alert('Failed to delete gem record');
    }
  };

  const handleUploadSuccess = async () => {
    setShowUploadModal(false);
    await updateUserStats(user.uid);
    fetchGems();
  };

  const handleGemUpdate = (updatedItem) => {
    setGems((current) =>
      current.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="flex flex-col gap-4 sm:gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            My Gem Collection
          </h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Organize, track, and review your gemstone records in one place.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="w-full md:w-auto inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          Add New Gem
        </button>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
        <FilterBar filters={filters} onFilterChange={setFilters} />
      </section>

      <section className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {isLoading ? 'Loading collection...' : `${gems.length} gem${gems.length === 1 ? '' : 's'} in your collection`}
        </div>
      </section>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900"></div>
        </div>
      ) : gems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white py-14 sm:py-20 px-4 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">No gems yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Add your first gem to start building your collection.
          </p>
          <button
            onClick={() => setShowUploadModal(true)}
            className="mt-6 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Add Your First Gem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {gems.map((item) => (
            <InventoryItemCard
              key={item.id}
              item={item}
              onEdit={handleGemUpdate}
              onDelete={() => handleGemDelete(item.id)}
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
    </div>
  );
}

export default Dashboard;