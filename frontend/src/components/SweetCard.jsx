import React, { useState } from 'react';
import { purchaseSweet } from '../services/sweetService';

export default function SweetCard({ sweet, onPurchase, onEdit, onDelete, isAdmin }) {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePurchase = async () => {
    if (quantity <= 0) {
      setError('Quantity must be at least 1');
      return;
    }

    if (quantity > sweet.quantity) {
      setError(`Only ${sweet.quantity} items available`);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const updated = await purchaseSweet(sweet._id, quantity);
      setQuantity(1);
      onPurchase(updated);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isInStock = sweet.quantity > 0;

  return (
    <div className="card p-6 flex flex-col h-full transition-transform hover:-translate-y-0.5">
      {/* Image */}
      <img
        src={sweet.imageUrl}
        alt={sweet.name}
        className="w-full h-48 object-cover rounded-lg mb-4"
      />

      {/* Content */}
      <div className="flex-grow">
        <h3 className="text-lg font-bold text-gray-800 mb-2">{sweet.name}</h3>

        <p className="text-gray-600 text-sm mb-3">
          {sweet.description || 'A delicious sweet treat'}
        </p>

        {/* Category & Price */}
        <div className="flex justify-between items-center mb-3">
          <span className="badge-info">{sweet.category}</span>
          <span className="text-lg font-bold text-emerald-600">₹{sweet.price.toFixed(2)}</span>
        </div>

        {/* Stock Status */}
        <div className="mb-4">
          <p className={`text-sm font-medium ${isInStock ? 'text-green-600' : 'text-red-600'}`}>
            {isInStock ? `${sweet.quantity} in stock` : 'Out of stock'}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded">
            <p className="text-red-600 text-xs">{error}</p>
          </div>
        )}
      </div>

      {/* Purchase Section */}
      {!isAdmin && isInStock && (
        <div className="mt-4 border-t pt-4">
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              min="1"
              max={sweet.quantity}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
            />
            <span className="text-sm text-gray-600">quantity</span>
          </div>
          <button
            onClick={handlePurchase}
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Purchasing...' : 'Purchase'}
          </button>
        </div>
      )}

      {!isAdmin && !isInStock && (
        <button disabled className="btn-secondary w-full mt-4 opacity-50 cursor-not-allowed">
          Out of Stock
        </button>
      )}

      {/* Admin Actions */}
      {isAdmin && (
        <div className="mt-4 border-t pt-4 flex gap-2">
          <button
            onClick={() => onEdit(sweet)}
            className="btn-secondary flex-1"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(sweet._id)}
            className="btn-danger flex-1"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
