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
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      alert("Please upload or take a photo of the gem.");
      return;
    }

    setSaving(true);

    try {
      const metadata = {
        ...formData,
        carat: formData.carat ? Number(formData.carat) : null,
        pricePaid: formData.pricePaid ? Number(formData.pricePaid) : null,
        quantity: formData.quantity ? Number(formData.quantity) : 1
      };

      await uploadInventoryItem(imageFile, metadata, userId);
      onSuccess();
    } catch (error) {
      console.error("Error saving gem:", error);
      alert("Failed to save gem.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#020617] border border-[#1e293b] rounded-2xl w-full max-w-3xl p-6 text-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
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

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="Gem Name"
            onChange={handleChange}
            required
            className="input-dark"
          />

          <div>
            <input
              name="stoneType"
              list="stoneTypes"
              placeholder="Stone Type"
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
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="color"
            placeholder="Color"
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="cut"
            placeholder="Cut"
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="origin"
            placeholder="Origin"
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="pricePaid"
            placeholder="Price Paid"
            onChange={handleChange}
            className="input-dark"
          />

          <input
            name="quantity"
            placeholder="Quantity"
            onChange={handleChange}
            className="input-dark"
          />

          <div className="md:col-span-2">
            <label className="text-sm text-gray-400 block mb-2">
              Gem Photo
            </label>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-amber-400 file:text-black
                hover:file:bg-amber-300"
              />

              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-300
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-slate-700 file:text-white
                hover:file:bg-slate-600"
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              Use the first button to upload an image, or the second to take a photo with your camera.
            </p>

            {imageFile && (
              <p className="text-xs text-amber-300 mt-2">
                Selected: {imageFile.name}
              </p>
            )}
          </div>

          <textarea
            name="notes"
            placeholder="Notes"
            onChange={handleChange}
            className="input-dark md:col-span-2 min-h-[100px]"
          />

          <div className="md:col-span-2 flex justify-between mt-4">
            <button
              type="submit"
              disabled={saving}
              className="bg-amber-400 text-black px-5 py-2 rounded-lg font-semibold hover:bg-amber-300 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Gem"}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="border border-gray-600 px-5 py-2 rounded-lg hover:border-gray-400"
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