import { useEffect, useMemo, useState } from "react";
import {
  uploadInventoryItem,
  updateInventoryItem,
} from "../lib/firebase/inventory-operations";

function FieldLabel({ children, optional = false }) {
  return (
    <label className="mb-1.5 block text-xs font-medium uppercase tracking-[0.16em] text-gray-400">
      {children}{" "}
      {optional && (
        <span className="normal-case tracking-normal text-gray-500">
          (optional)
        </span>
      )}
    </label>
  );
}

function TextInput({
  name,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  min,
  step,
}) {
  return (
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      min={min}
      step={step}
      className="w-full rounded-xl border border-[#1e293b] bg-[#020617] px-4 py-3 text-gray-100 placeholder-gray-500 outline-none transition focus:border-amber-400"
    />
  );
}

function getInitialFormData(initialData, mode) {
  if (mode === "edit" && initialData) {
    return {
      name: initialData.name || "",
      stoneType: initialData.stoneType || "",
      category: initialData.category || "Gem",
      carat:
        initialData.carat !== null &&
        initialData.carat !== undefined &&
        initialData.carat !== ""
          ? String(initialData.carat)
          : "",
      color: initialData.color || "",
      cut: initialData.cut || "",
      origin: initialData.origin || "",
      pricePaid:
        initialData.pricePaid !== null &&
        initialData.pricePaid !== undefined &&
        initialData.pricePaid !== ""
          ? String(initialData.pricePaid)
          : "",
      quantity:
        initialData.quantity !== null &&
        initialData.quantity !== undefined &&
        initialData.quantity !== ""
          ? String(initialData.quantity)
          : "1",
      notes: initialData.notes || "",
      isForSale: !!initialData.isForSale,
      salePrice:
        initialData.salePrice !== null &&
        initialData.salePrice !== undefined &&
        initialData.salePrice !== ""
          ? String(initialData.salePrice)
          : "",
    };
  }

  return {
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
    isForSale: false,
    salePrice: "",
  };
}

async function createThumbnail(file, maxWidth = 600) {
  return new Promise((resolve) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");

      const scale = maxWidth / img.width;
      canvas.width = maxWidth;
      canvas.height = img.height * scale;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          const thumbnailFile = new File(
            [blob],
            `thumb_${file.name}`,
            { type: "image/webp" }
          );
          resolve(thumbnailFile);
        },
        "image/webp",
        0.8
      );
    };

    reader.readAsDataURL(file);
  });
}

function InventoryUploadModal({
  onClose,
  onSuccess,
  userId,
  mode = "create",
  initialData = null,
  onNotify,
}) {
  const isEditMode = mode === "edit";

  const [formData, setFormData] = useState(
    getInitialFormData(initialData, mode)
  );
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(getInitialFormData(initialData, mode));
    setImageFile(null);
  }, [initialData, mode]);

  const selectedPreviewUrl = useMemo(() => {
    if (!imageFile) return null;
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event) => {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [saving, onClose]);

  const previewUrl =
    selectedPreviewUrl || (isEditMode ? initialData?.imageUrl || null : null);

  const notify = (type, message, title) => {
    if (onNotify) {
      onNotify({ type, message, title });
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };

      if (name === "isForSale" && !checked) {
        next.salePrice = "";
      }

      return next;
    });
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleRemoveNewImage = () => {
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      notify("error", "User session lost. Please log in again.", "Session issue");
      return;
    }

    if (!formData.name.trim()) {
      notify("error", "Please enter a gem name.", "Missing name");
      return;
    }

    if (isEditMode && !initialData?.id) {
      notify("error", "Missing gem data for editing.", "Edit error");
      return;
    }

    if (!isEditMode && !imageFile) {
      notify("error", "Please upload or take a photo of the gem.", "Image required");
      return;
    }

    if (formData.isForSale && !formData.salePrice.trim()) {
      notify("error", "Please enter a sale price for items listed for sale.", "Sale price required");
      return;
    }

    setSaving(true);

    try {
      const metadata = {
        name: formData.name.trim(),
        stoneType: formData.stoneType.trim(),
        category: formData.category,
        carat: formData.carat?.trim() ? Number(formData.carat) : null,
        color: formData.color.trim(),
        cut: formData.cut.trim(),
        origin: formData.origin.trim(),
        pricePaid: formData.pricePaid?.trim()
          ? Number(formData.pricePaid)
          : null,
        quantity: formData.quantity?.trim() ? Number(formData.quantity) : 1,
        notes: formData.notes.trim(),
        isForSale: !!formData.isForSale,
        salePrice:
          formData.isForSale && formData.salePrice?.trim()
            ? Number(formData.salePrice)
            : null,
        saleUpdatedAt: formData.isForSale ? new Date() : null,
      };

      if (isEditMode) {
        let imagePayload = null;

        if (imageFile) {
          const thumbnailFile = await createThumbnail(imageFile);
          imagePayload = {
            original: imageFile,
            thumbnail: thumbnailFile,
          };
        }

        await updateInventoryItem(
          initialData.id,
          metadata,
          userId,
          imagePayload
        );y
      } else {
        const thumbnailFile = await createThumbnail(imageFile);

        await uploadInventoryItem(
          {
            original: imageFile,
            thumbnail: thumbnailFile,
          },
          metadata,
          userId
        );
      }

      if (onSuccess) {
        await onSuccess();
      }
    } catch (error) {
      console.error(`Error ${isEditMode ? "updating" : "saving"} gem:`, error);
      notify(
        "error",
        error?.message || `Failed to ${isEditMode ? "update" : "save"} gem.`,
        isEditMode ? "Update failed" : "Save failed"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[90] bg-black/70 backdrop-blur-[1px]"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div className="flex min-h-full items-start justify-center overflow-y-auto p-3 sm:items-center sm:p-6">
        <div
          className="my-3 flex max-h-[calc(100vh-1.5rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#020617] text-gray-200 shadow-[0_24px_70px_rgba(0,0,0,0.45)] sm:max-h-[92vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 z-10 border-b border-white/10 bg-[#061224]/95 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-400/80">
                  {isEditMode ? "Collection update" : "Collection entry"}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-amber-300 sm:text-2xl">
                  {isEditMode ? "Edit Gem" : "Add New Gem"}
                </h2>
                <p className="mt-1 text-sm text-gray-400">
                  {isEditMode
                    ? "Update the gem details, manage sale status, and optionally replace the current image."
                    : "Save the stone details, attach a photo, and choose whether to list it publicly for sale."}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-sm text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close gem modal"
              >
                ✕
              </button>
            </div>
          </div>

          <form
            id="gem-form"
            onSubmit={handleSubmit}
            className="flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-6"
          >
            <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">
                      Gem details
                    </h3>
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
                      <FieldLabel optional>Carat</FieldLabel>
                      <TextInput
                        name="carat"
                        placeholder="1.15"
                        value={formData.carat}
                        onChange={handleChange}
                        type="number"
                        min="0"
                        step="0.01"
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
                        min="0"
                        step="0.01"
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
                        min="1"
                        step="1"
                      />
                    </div>
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">
                      Sale settings
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Control whether this gem appears in the public collection.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#020617] px-4 py-3">
                      <input
                        type="checkbox"
                        name="isForSale"
                        checked={formData.isForSale}
                        onChange={handleChange}
                        className="h-4 w-4 accent-amber-400"
                      />
                      <div>
                        <p className="text-sm font-medium text-white">
                          List this gem for sale
                        </p>
                        <p className="text-xs text-gray-400">
                          Public visitors will only see gems switched on here.
                        </p>
                      </div>
                    </label>

                    {formData.isForSale && (
                      <div>
                        <FieldLabel>Sale Price</FieldLabel>
                        <TextInput
                          name="salePrice"
                          placeholder="45000"
                          value={formData.salePrice}
                          onChange={handleChange}
                          type="number"
                          min="0"
                          step="0.01"
                          required={formData.isForSale}
                        />
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-white">Notes</h3>
                    <p className="mt-1 text-xs text-gray-400">
                      Add anything useful like purchase source, treatment, or
                      identification notes.
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
                    <h3 className="text-sm font-semibold text-white">
                      Gem Photo
                    </h3>
                    <p className="mt-1 text-xs text-gray-400">
                      {isEditMode
                        ? "Keep the current image or choose a new one to replace it."
                        : "Upload an image from your device or capture a fresh photo."}
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
                      {isEditMode ? "Replace from device" : "Upload from device"}
                    </label>

                    <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      {isEditMode ? "Replace with camera" : "Take photo with camera"}
                    </label>

                    {isEditMode && imageFile && (
                      <button
                        type="button"
                        onClick={handleRemoveNewImage}
                        className="w-full rounded-2xl border border-white/10 px-4 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white"
                      >
                        Keep current image instead
                      </button>
                    )}

                    <p className="text-xs leading-5 text-gray-500">
                      A clear close-up on a plain background works best for
                      reviewing your collection later.
                    </p>
                  </div>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#020617]">
                    {previewUrl ? (
                      <div>
                        <div className="aspect-square w-full bg-[#020617]">
                          <img
                            src={previewUrl}
                            alt="Gem preview"
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="border-t border-white/10 px-4 py-3">
                          <p className="truncate text-sm font-medium text-white">
                            {imageFile
                              ? imageFile.name
                              : initialData?.name || "Current gem image"}
                          </p>
                          <p className="mt-1 text-xs text-gray-400">
                            {imageFile
                              ? isEditMode
                                ? "New image selected"
                                : "Ready to upload"
                              : isEditMode
                              ? "Current saved image"
                              : "Ready to upload"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex aspect-square items-center justify-center px-6 text-center text-sm text-gray-500">
                        {isEditMode
                          ? "No saved image found"
                          : "No image selected yet"}
                      </div>
                    )}
                  </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#04101f]/70 p-4 sm:p-5">
                  <h3 className="text-sm font-semibold text-white">
                    Quick check
                  </h3>
                  <div className="mt-3 space-y-2 text-sm text-gray-400">
                    <p>• Name and photo are the most important fields.</p>
                    <p>• Sale price is required only if the gem is listed publicly.</p>
                    <p>• Public visitors will only see items marked for sale.</p>
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
                disabled={saving}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                form="gem-form"
                disabled={saving}
                className="rounded-xl bg-amber-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving
                  ? isEditMode
                    ? "Saving Changes..."
                    : "Saving..."
                  : isEditMode
                  ? "Save Changes"
                  : "Save Gem"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InventoryUploadModal;