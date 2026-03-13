import { useMemo, useState } from "react";
import { uploadInventoryItem } from "../lib/firebase/inventory-operations";

function FieldLabel({ children, optional = false }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
      {children} {optional && <span className="normal-case tracking-normal text-gray-500">(optional)</span>}
    </label>
  );
}

function TextInput({ name, value, onChange, placeholder, type = "text", required = false }) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-400"
    />
  );
}

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
    notes: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const previewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
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
        quantity: formData.quantity?.trim() ? Number(formData.quantity) : 1,
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
    <div className="fixed inset-0 z-50 bg-black/70">
      <div className="flex min-h-full items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
        <div className="my-3 flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#020617] text-gray-200 shadow-[0_24px_70px_rgba(0,0,0,0.45)] max-h-[calc(100vh-1.5rem)] sm:max-h-[92vh]">
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#061224]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-400/80">
                  Collection entry
                </p>
                <h2 className="mt-1 text-xl font-semibold text-amber-300 sm:text-2xl">
                  Add New Gem
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  Save the stone details and attach a clear photo for your inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white"
                aria-label="Close add gem modal"
              >
                ✕
              </button>
            </div>
          </div>

          <form id="add-gem-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6">
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">Gem details</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Basic identification and collection information.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <FieldLabel>Name</FieldLabel>
                      <TextInput
                        name="name"
                        placeholder="Purple Spinel"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div>
                      <FieldLabel>Stone Type</FieldLabel>
                      <div>
                        <input
                          name="stoneType"
                          list="stoneTypes"
                          placeholder="Spinel"
                          value={formData.stoneType}
                          onChange={handleChange}
                          className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-400"
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
                    </div>

                    <div>
                      <FieldLabel>Category</FieldLabel>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 outline-none transition focus:border-amber-400"
                      >
                        <option value="Gem">Gem</option>
                        <option value="Rough">Rough</option>
                        <option value="Crystal">Crystal</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <FieldLabel>Carat</FieldLabel>
                      <TextInput
                        name="carat"
                        placeholder="1.15"
                        value={formData.carat}
                        onChange={handleChange}
                        type="number"
                      />
                    </div>

                    <div>
                      <FieldLabel optional>Color</FieldLabel>
                      <TextInput
                        name="color"
                        placeholder="Purple"
                        value={formData.color}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <FieldLabel optional>Cut</FieldLabel>
                      <TextInput
                        name="cut"
                        placeholder="Oval"
                        value={formData.cut}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <FieldLabel optional>Origin</FieldLabel>
                      <TextInput
                        name="origin"
                        placeholder="Sri Lanka"
                        value={formData.origin}
                        onChange={handleChange}
                      />
                    </div>

                    <div>
                      <FieldLabel optional>Price Paid</FieldLabel>
                      <TextInput
                        name="pricePaid"
                        placeholder="13000"
                        value={formData.pricePaid}
                        onChange={handleChange}
                        type="number"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <FieldLabel>Quantity</FieldLabel>
                      <TextInput
                        name="quantity"
                        placeholder="1"
                        value={formData.quantity}
                        onChange={handleChange}
                        type="number"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">Notes</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Add anything useful like purchase source, treatment, or identification notes.
                    </p>
                  </div>

                  <div>
                    <FieldLabel optional>Collection Notes</FieldLabel>
                    <textarea
                      name="notes"
                      placeholder="Bought for personal collection. Nice purple saturation. Needs further identification check."
                      value={formData.notes}
                      onChange={handleChange}
                      className="min-h-[120px] w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-400"
                    />
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">Gem Photo</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Upload an image from your device or capture a fresh photo.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-amber-400/25 bg-amber-400/10 px-4 py-3 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      Upload from device
                    </label>

                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      Take photo with camera
                    </label>

                    <p className="text-xs leading-5 text-gray-500">
                      A clear close-up on a plain background works best for reviewing your collection later.
                    </p>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#020617]">
                    {previewUrl ? (
                      <div>
                        <img
                          src={previewUrl}
                          alt="Selected gem preview"
                          className="h-56 w-full object-cover"
                        />
                        <div className="border-t border-white/10 px-4 py-3">
                          <p className="truncate text-sm font-medium text-white">
                            {imageFile?.name}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            Ready to upload
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-gray-500">
                        No image selected yet
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-white">Quick check</h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-400">
                    <p>• Name and photo are the most important fields.</p>
                    <p>• Carat and price can be added later if needed.</p>
                    <p>• This entry will be saved to your personal collection.</p>
                  </div>
                </section>
              </div>
            </div>
          </form>

          <div className="sticky bottom-0 border-t border-white/10 bg-[#061224]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="add-gem-form"
                disabled={saving}
                className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Gem"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryUploadModal;