import { useRef, useState } from "react";
import Webcam from "react-webcam";
import { uploadInventoryItem } from "../lib/firebase/inventory-operations";

const STONE_TYPE_SUGGESTIONS = [
  "Sapphire",
  "Star Sapphire",
  "Ruby",
  "Spinel",
  "Garnet",
  "Tourmaline",
  "Zircon",
  "Topaz",
  "Aquamarine",
  "Amethyst",
  "Peridot",
  "Citrine",
  "Quartz",
  "Moonstone",
  "Opal",
  "Beryl",
  "Alexandrite",
  "Chrysoberyl",
  "Tanzanite",
  "Diamond"
];

function InventoryUploadModal({ onClose, onSuccess, userId }) {
  const webcamRef = useRef(null);

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState("file");
  const [previewUrl, setPreviewUrl] = useState(null);

  const [metadata, setMetadata] = useState({
    name: "",
    category: "",
    stoneType: "",
    carat: "",
    color: "",
    cut: "",
    origin: "",
    pricePaid: "",
    notes: "",
    quantity: 1
  });

  const handleChange = (field, value) => {
    setMetadata((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
  };

  const handleCapturePhoto = async () => {
    if (!webcamRef.current) return;

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    const response = await fetch(imageSrc);
    const blob = await response.blob();

    const capturedFile = new File(
      [blob],
      `gem_${Date.now()}.jpg`,
      { type: "image/jpeg" }
    );

    setFile(capturedFile);
    setPreviewUrl(imageSrc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please upload or capture a gem photo");
      return;
    }

    setLoading(true);

    try {
      await uploadInventoryItem(file, metadata, userId);
      onSuccess();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload gem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto">
      <div className="min-h-screen flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="w-full sm:max-w-2xl rounded-t-2xl sm:rounded-2xl bg-white shadow-xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
          <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Add New Gem</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-xl px-2"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="overflow-y-auto px-4 sm:px-6 py-5 space-y-5">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Gem Photo
                </label>

                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMethod("file")}
                    className={`rounded-md px-4 py-3 text-sm ${
                      uploadMethod === "file"
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700"
                    }`}
                  >
                    Upload File
                  </button>

                  <button
                    type="button"
                    onClick={() => setUploadMethod("camera")}
                    className={`rounded-md px-4 py-3 text-sm ${
                      uploadMethod === "camera"
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-700"
                    }`}
                  >
                    Take Photo
                  </button>
                </div>

                {uploadMethod === "file" ? (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-3 block w-full"
                    required={!file}
                  />
                ) : (
                  <div className="mt-3 space-y-3">
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <Webcam
                        ref={webcamRef}
                        audio={false}
                        screenshotFormat="image/jpeg"
                        className="w-full h-56 sm:h-64 object-cover"
                        videoConstraints={{
                          facingMode: "environment"
                        }}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleCapturePhoto}
                      className="w-full sm:w-auto rounded-md bg-emerald-600 px-4 py-3 text-sm text-white hover:bg-emerald-700"
                    >
                      Capture Photo
                    </button>
                  </div>
                )}

                {previewUrl && (
                  <div className="mt-4">
                    <p className="mb-2 text-sm font-medium text-gray-700">
                      Preview
                    </p>
                    <div className="overflow-hidden rounded-xl border border-gray-200">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-48 sm:h-56 object-cover"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name / Label
                </label>
                <input
                  type="text"
                  value={metadata.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Example: Royal Blue Sapphire"
                  className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  value={metadata.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                  required
                >
                  <option value="">Select category</option>
                  <option value="Gem">Gem</option>
                  <option value="Diamond">Diamond</option>
                  <option value="Rough">Rough</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Stone Type
                </label>
                <input
                  type="text"
                  list="stone-type-suggestions"
                  value={metadata.stoneType}
                  onChange={(e) => handleChange("stoneType", e.target.value)}
                  placeholder="Sapphire, Garnet, Spinel..."
                  className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                />
                <datalist id="stone-type-suggestions">
                  {STONE_TYPE_SUGGESTIONS.map((stone) => (
                    <option key={stone} value={stone} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Carat
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metadata.carat}
                    onChange={(e) => handleChange("carat", e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Price Paid
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={metadata.pricePaid}
                    onChange={(e) => handleChange("pricePaid", e.target.value)}
                    className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Color
                </label>
                <input
                  type="text"
                  value={metadata.color}
                  onChange={(e) => handleChange("color", e.target.value)}
                  className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Cut
                </label>
                <input
                  type="text"
                  value={metadata.cut}
                  onChange={(e) => handleChange("cut", e.target.value)}
                  placeholder="Oval, Cushion, Emerald..."
                  className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Origin
                </label>
                <input
                  type="text"
                  value={metadata.origin}
                  onChange={(e) => handleChange("origin", e.target.value)}
                  placeholder="Sri Lanka, Madagascar..."
                  className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  value={metadata.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows="4"
                  className="mt-1 w-full rounded-md border px-3 py-3 sm:py-2"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 px-4 sm:px-6 py-4 flex flex-col-reverse sm:flex-row justify-end gap-3 bg-white rounded-b-2xl">
              <button
                type="button"
                onClick={onClose}
                className="w-full sm:w-auto rounded-md border px-4 py-3 sm:py-2"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-md bg-blue-600 px-4 py-3 sm:py-2 text-white disabled:opacity-50"
              >
                {loading ? "Uploading..." : "Add Gem"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InventoryUploadModal;