import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../components/Toast";
import { useAuth } from "../../contexts/AuthContext";
import { uploadInventoryItem } from "../../lib/firebase/inventory-operations";
import { updateUserStats } from "../../lib/firebase/users";

function FieldLabel({ children, optional = false }) {
  return (
    <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-white/42">
      {children}{" "}
      {optional && (
        <span className="normal-case tracking-normal text-white/28">
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
  disabled = false,
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
      disabled={disabled}
      className="w-full rounded-2xl border border-white/8 bg-[#020617] px-3.5 py-2.5 text-sm text-white placeholder:text-white/26 outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-amber-300/30 focus:bg-[#030a16] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
    />
  );
}

function generateStoneCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "FV-";

  for (let i = 0; i < 5; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return code;
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
      isFeatured: !!initialData.isFeatured,
      isCollectorPiece: !!initialData.isCollectorPiece,
      isSold: !!initialData.isSold,
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
    isFeatured: false,
    isCollectorPiece: false,
    isSold: false,
  };
}

async function createThumbnail(file, maxWidth = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file."));
    };

    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");

        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to create image canvas."));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to generate compressed image."));
              return;
            }

            const baseName = file.name.replace(/\.[^/.]+$/, "");
            const thumbnailFile = new File([blob], `${baseName}-thumb.webp`, {
              type: "image/webp",
            });

            resolve(thumbnailFile);
          },
          "image/webp",
          quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Selected file is not a valid image."));
    };

    reader.readAsDataURL(file);
  });
}

function CompactToggle({ label, name, checked, onChange }) {
  return (
    <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 bg-[#020617] px-3.5 py-3 transition-colors duration-200 hover:border-white/12">
      <span className="text-sm text-white/88">{label}</span>
      <input
        type="checkbox"
        name={name}
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-amber-300"
      />
    </label>
  );
}

export function GemFormPage({
  mode = "create",
  initialData = null,
  gemId = null,
}) {
  const isEditMode = mode === "edit";
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState(
    getInitialFormData(initialData, mode)
  );
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

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

  const previewUrl =
    selectedPreviewUrl || (isEditMode ? initialData?.imageUrl || null : null);

  const notify = (type, message, title) => {
    setToast({ type, message, title });
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

      if (name === "isSold" && checked) {
        next.isForSale = false;
        next.salePrice = "";
      }

      if (name === "isForSale" && checked) {
        next.isSold = false;
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

    if (!user?.uid) {
      notify("error", "User session lost. Please log in again.", "Session issue");
      return;
    }

    if (!formData.name.trim()) {
      notify("error", "Please enter a gem name.", "Missing name");
      return;
    }

    if (!isEditMode && !imageFile) {
      notify("error", "Please upload or take a photo of the gem.", "Image required");
      return;
    }

    if (isEditMode && !gemId) {
      notify("error", "Missing gem data for editing.", "Edit error");
      return;
    }

    if (formData.isForSale && !formData.salePrice.trim()) {
      notify(
        "error",
        "Please enter a sale price for items listed for sale.",
        "Sale price required"
      );
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
        isFeatured: !!formData.isFeatured,
        isCollectorPiece: !!formData.isCollectorPiece,
        isSold: !!formData.isSold,
        saleUpdatedAt: formData.isForSale ? new Date() : null,
      };

      let imagePayload = null;

      if (imageFile) {
        let thumbnailFile = null;

        try {
          thumbnailFile = await createThumbnail(imageFile);
        } catch (thumbnailError) {
          console.warn(
            "Thumbnail generation failed, continuing with original image only:",
            thumbnailError
          );
        }

        imagePayload = {
          original: imageFile,
          thumbnail: thumbnailFile,
        };
      }

      if (isEditMode) {
        const { updateInventoryItem } = await import(
          "../../lib/firebase/inventory-operations"
        );
        await updateInventoryItem(gemId, metadata, user.uid, imagePayload);
      } else {
        await uploadInventoryItem(
          imagePayload,
          {
            ...metadata,
            stoneCode: generateStoneCode(),
          },
          user.uid
        );
      }

      await updateUserStats(user.uid);

      notify(
        "success",
        isEditMode
          ? "Your gem was updated successfully."
          : "Your new gem was added to the collection.",
        isEditMode ? "Gem updated" : "Gem saved"
      );

      window.setTimeout(() => {
        navigate(isEditMode ? `/admin/stone/${gemId}` : "/admin");
      }, 350);
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
    <div className="space-y-3 sm:space-y-4 lg:space-y-5">
      <Toast toast={toast} onClose={() => setToast(null)} />

      <section className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(7,18,36,0.76),rgba(4,12,26,0.74))] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.2)] backdrop-blur-md sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-amber-300/72">
              {isEditMode ? "Collection update" : "Collection entry"}
            </p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              {isEditMode ? "Edit Gem" : "Add New Gem"}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              {isEditMode
                ? "Update details, image, and sale status."
                : "Add a new stone with photo and listing status."}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate(isEditMode && gemId ? `/admin/stone/${gemId}` : "/admin")
            }
            disabled={saving}
            className="rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white disabled:opacity-50"
          >
            Back
          </button>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4 sm:p-4.5">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">Gem details</h3>
                <p className="mt-1 text-xs text-white/42">
                  Main identification and collection info.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
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
                  <TextInput
                    name="stoneType"
                    placeholder="Spinel"
                    value={formData.stoneType}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <FieldLabel>Category</FieldLabel>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/8 bg-[#020617] px-3.5 py-2.5 text-sm text-white outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-amber-300/30 focus:bg-[#030a16] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.05)]"
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
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="1.15"
                    value={formData.carat}
                    onChange={handleChange}
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
                  <FieldLabel optional>Quantity</FieldLabel>
                  <TextInput
                    name="quantity"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="1"
                    value={formData.quantity}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <FieldLabel optional>Price Paid (LKR)</FieldLabel>
                  <TextInput
                    name="pricePaid"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="25000"
                    value={formData.pricePaid}
                    onChange={handleChange}
                  />
                </div>

                <div>
                  <FieldLabel optional>Sale Price (LKR)</FieldLabel>
                  <TextInput
                    name="salePrice"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="45000"
                    value={formData.salePrice}
                    onChange={handleChange}
                    disabled={!formData.isForSale}
                  />
                </div>
              </div>
            </section>

            <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">Notes</h3>
                <p className="mt-1 text-xs text-white/42">
                  Internal notes for this stone.
                </p>
              </div>

              <textarea
                name="notes"
                rows="4"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add notes about this gem..."
                className="w-full rounded-2xl border border-white/8 bg-[#020617] px-3.5 py-3 text-sm text-white placeholder:text-white/26 outline-none transition-[border-color,background-color,box-shadow] duration-200 focus:border-amber-300/30 focus:bg-[#030a16] focus:shadow-[0_0_0_3px_rgba(251,191,36,0.05)]"
              />
            </section>
          </div>

          <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">
            <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">Image</h3>
                <p className="mt-1 text-xs text-white/42">
                  {isEditMode
                    ? "Replace only if needed."
                    : "Upload a clear image of the gem."}
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/8 bg-[#020617]">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Gem preview"
                    className="aspect-[4/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center text-sm text-white/30">
                    No image selected
                  </div>
                )}
              </div>

              <div className="mt-3 space-y-2.5">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.22em] text-white/42">
                    Upload image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    disabled={saving}
                    className="block w-full text-sm text-white/42 file:mr-3 file:rounded-2xl file:border-0 file:bg-amber-300 file:px-3.5 file:py-2.5 file:text-sm file:font-semibold file:text-[#09101c] hover:file:brightness-105"
                  />
                </label>

                {imageFile && (
                  <button
                    type="button"
                    onClick={handleRemoveNewImage}
                    disabled={saving}
                    className="w-full rounded-2xl border border-white/8 bg-white/[0.025] px-4 py-2.5 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white disabled:opacity-50"
                  >
                    Remove selected image
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
              <div className="mb-3">
                <h3 className="text-sm font-semibold text-white">Status</h3>
              </div>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                <CompactToggle
                  label="List for sale"
                  name="isForSale"
                  checked={formData.isForSale}
                  onChange={handleChange}
                />
                <CompactToggle
                  label="Featured"
                  name="isFeatured"
                  checked={formData.isFeatured}
                  onChange={handleChange}
                />
                <CompactToggle
                  label="Collector piece"
                  name="isCollectorPiece"
                  checked={formData.isCollectorPiece}
                  onChange={handleChange}
                />
                <CompactToggle
                  label="Mark as sold"
                  name="isSold"
                  checked={formData.isSold}
                  onChange={handleChange}
                />
              </div>
            </section>

            <div className="rounded-[26px] border border-white/8 bg-[linear-gradient(180deg,rgba(2,6,23,0.95),rgba(4,12,26,0.96))] p-4">
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl bg-amber-300 px-5 py-3 text-sm font-semibold text-[#09101c] transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : isEditMode
                    ? "Save Changes"
                    : "Save Gem"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      isEditMode && gemId ? `/admin/stone/${gemId}` : "/admin"
                    )
                  }
                  disabled={saving}
                  className="w-full rounded-2xl border border-white/8 bg-white/[0.025] px-5 py-3 text-sm font-medium text-white/72 transition hover:border-white/14 hover:text-white disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

function AddGemPage() {
  return <GemFormPage mode="create" />;
}

export default AddGemPage;