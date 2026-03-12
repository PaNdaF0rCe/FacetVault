import React, { useState } from 'react';
import { updateItemQuantity } from '../lib/firebase/inventory-operations';

function InventoryItemCard({ item, onEdit, onDelete }) {
  const [quantity, setQuantity] = useState(item.quantity || 1);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;

    try {
      setIsUpdating(true);
      await updateItemQuantity(item.id, newQuantity);
      setQuantity(newQuantity);

      if (onEdit) {
        onEdit({
          ...item,
          quantity: newQuantity
        });
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatPrice = (value) => {
    if (value === undefined || value === null || value === '') return '—';
    return Number(value).toLocaleString();
  };

  return (
    <div className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={item.imageUrl || '/placeholder.png'}
          alt={item.name || 'Gem image'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-x-0 top-0 flex items-center justify-between p-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-gray-800 backdrop-blur-sm">
            {item.category || 'Gem'}
          </span>

          {item.carat ? (
            <span className="rounded-full bg-blue-600/90 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
              {item.carat} ct
            </span>
          ) : null}
        </div>
      </div>

      <div className="p-5">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {item.name || 'Unnamed Gem'}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {item.stoneType || 'Unknown stone type'}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <div>
            <p className="text-gray-400">Color</p>
            <p className="font-medium text-gray-800">{item.color || '—'}</p>
          </div>

          <div>
            <p className="text-gray-400">Cut</p>
            <p className="font-medium text-gray-800">{item.cut || '—'}</p>
          </div>

          <div>
            <p className="text-gray-400">Origin</p>
            <p className="font-medium text-gray-800">{item.origin || '—'}</p>
          </div>

          <div>
            <p className="text-gray-400">Price Paid</p>
            <p className="font-medium text-gray-800">{formatPrice(item.pricePaid)}</p>
          </div>
        </div>

        {item.notes ? (
          <div className="mt-4 rounded-xl bg-gray-50 p-3">
            <p className="text-xs uppercase tracking-wide text-gray-400">Notes</p>
            <p className="mt-1 text-sm text-gray-700 line-clamp-2">{item.notes}</p>
          </div>
        ) : null}

        <div className="mt-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-400">Quantity</p>
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={isUpdating || quantity <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:opacity-50"
              >
                −
              </button>

              <span className="min-w-[24px] text-center font-semibold text-gray-900">
                {quantity}
              </span>

              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={isUpdating}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-green-200 bg-green-50 text-green-600 transition hover:bg-green-100 disabled:opacity-50"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
          <button
            onClick={() => onEdit && onEdit(item)}
            className="rounded-lg px-3 py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
          >
            Edit
          </button>

          <button
            onClick={onDelete}
            className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default InventoryItemCard;