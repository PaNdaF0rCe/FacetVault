import { useState } from "react";
import { uploadInventoryItem } from "../lib/firebase/inventory-operations";

function InventoryUploadModal({ onClose, onSuccess, userId }) {
  const [formData, setFormData] = useState({
    name: "",
    stoneType: "",
    category: "Gem",
    carat: "",
    color: "",
    cut: "",
    origin: "",
    pricePaid: "",
    quantity: "1",
    notes: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      alert("User session lost. Please log in again.");
      return;
    }

    if (!imageFile) {
      alert("Please upload or take a photo of the gem.");
      return;
    }

    setSaving(true);

    try {
      const metadata = {
        ...formData,
        carat: formData.carat?.trim() ? Number(formData.carat) : null,
        pricePaid: formData.pricePaid?.trim() ? Number(formData.pricePaid) : null,
        quantity: formData.quantity?.trim() ? Number(formData.quantity) : 1
      };

      await uploadInventoryItem(imageFile, metadata, userId);

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error("Error saving gem:", error);
      alert(error?.message || "Failed to save gem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-[#1e293b] bg-[#020617] p-6 text-gray-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-amber-300">
            Add New Gem
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            name="name"
            placeholder="Gem Name"
            value={formData.name}
            onChange={handleChange}
            required
            className="input-dark"
          />

          <div>
            <input
              name="stoneType"
              list="stoneTypes"
              placeholder="Stone Type"
              value={formData.stoneType}
              onChange={handleChange}
              className="input-dark w-full"
            />

            <datalist id="stoneTypes">
              <option value="Sapphire" />
              <option value="Ruby" />
              <option value="Emerald" />
              <option value="Spinel" />
              <option value="Tourmaline" />
              <option value="Topaz" />
              <option value="Aquamarine" />
              <option value="Garnet" />
              <option value="Zircon" />
              <option value="Peridot" />
              <option value="Amethyst" />
              <option value="Citrine" />
              <option value="Tanzanite" />
              <option value="Alexandrite" />
              <option value="Chrysoberyl" />
              <option value="Moonstone" />
              <option value="Sunstone" />
              <option value="Labradorite" />
              <option value="Opal" />
              <option value="Fire Opal" />
              <option value="Black Opal" />
              <option value="Jade" />
              <option value="Nephrite" />
              <option value="Turquoise" />
              <option value="Lapis Lazuli" />
              <option value="Malachite" />
              <option value="Amazonite" />
              <option value="Rhodochrosite" />
              <option value="Kunzite" />
              <option value="Morganite" />
              <option value="Beryl" />
              <option value="Heliodor" />
              <option value="Iolite" />
              <option value="Andalusite" />
              <option value="Diopside" />
              <option value="Chrome Diopside" />
              <option value="Sphene" />
              <option value="Apatite" />
              <option value="Fluorite" />
              <option value="Scapolite" />
              <option value="Danburite" />
              <option value="Hackmanite" />
              <option value="Taaffeite" />
              <option value="Painite" />
              <option value="Quartz" />
              <option value="Rose Quartz" />
              <option value="Smoky Quartz" />
              <option value="Ametrine" />
              <option value="Agate" />
              <option value="Carnelian" />
              <option value="Onyx" />
              <option value="Chalcedony" />
              <option value="Bloodstone" />
              <option value="Serpentine" />
              <option value="Prehnite" />
              <option value="Larimar" />
            </datalist>
          </div>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="input-dark"
          >
            <option value="Gem">Gem</option>
            <option value="Rough">Rough</option>
            <option value="Crystal">Crystal</option>
            <option value="Other">Other</option>
          </select>

          <input
            name="carat"
            placeholder="Carat"
            value={formData.carat}
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="color"
            placeholder="Color"
            value={formData.color}
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="cut"
            placeholder="Cut"
            value={formData.cut}
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="origin"
            placeholder="Origin"
            value={formData.origin}
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="pricePaid"
            placeholder="Price Paid"
            value={formData.pricePaid}
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="quantity"
            placeholder="Quantity"
            value={formData.quantity}
            onChange={handleChange}
            className="input-dark"
          />

          <div className="md:col-span-2">
            <label className="mb-2 block text-sm text-gray-400">
              Gem Photo
            </label>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300
                file:mr-4 file:rounded-lg file:border-0
                file:bg-amber-400 file:px-4 file:py-2
                file:text-sm file:font-semibold file:text-black
                hover:file:bg-amber-300"
              />

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300
                file:mr-4 file:rounded-lg file:border-0
                file:bg-slate-700 file:px-4 file:py-2
                file:text-sm file:font-semibold file:text-white
                hover:file:bg-slate-600"
              />
            </div>

            <p className="mt-2 text-xs text-gray-500">
              Use the first button to upload an image, or the second to take a photo with your camera.
            </p>

            {imageFile && (
              <p className="mt-2 text-xs text-amber-300">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            value={formData.notes}
            onChange={handleChange}
            className="input-dark min-h-[100px] md:col-span-2"
          />

          <div className="mt-4 flex justify-between md:col-span-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-amber-400 px-5 py-2 font-semibold text-black transition hover:bg-amber-300 disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Gem"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-600 px-5 py-2 hover:border-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default InventoryUploadModal;