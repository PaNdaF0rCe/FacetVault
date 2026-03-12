import React from "react";

export default function InventoryUploadModal({
  children
}) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[520px] max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl p-6">
        {children}
      </div>
    </div>
  );
}