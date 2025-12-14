import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createSweet, updateSweet } from '../services/sweetService';

export default function AdminSweetForm() {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Chocolate',
    price: '',
    quantity: '',
    description: '',
    imageUrl: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const isEditing = !!id;

  useEffect(() => {
    if (isEditing && location.state?.sweet) {
      const sweet = location.state.sweet;
      setFormData({
        name: sweet.name,
        category: sweet.category,
        price: sweet.price,
        quantity: sweet.quantity,
        description: sweet.description || '',
        imageUrl: sweet.imageUrl || '',
      });
    }
  }, [isEditing, location.state]);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
    }
  }, [isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'quantity' ? parseFloat(value) || '' : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.price || formData.quantity === '') {
      setError('Name, category, price, and quantity are required');
      return;
    }

    if (formData.price < 0 || formData.quantity < 0) {
      setError('Price and quantity cannot be negative');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        await updateSweet(id, formData);
      } else {
        await createSweet(formData);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['Chocolate', 'Candy', 'Gummies', 'Lollipop', 'Hard Candy', 'Sour', 'Other'];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container max-w-2xl">
        <button
          onClick={() => navigate('/dashboard')}
          className="text-blue-600 hover:text-blue-700 mb-6"
        >
          ← Back to Dashboard
        </button>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            {isEditing ? 'Edit Sweet' : 'Add New Sweet'}
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sweet Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ras Malai"
                className="input-field"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price (₹) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="input-field"
                />
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                  placeholder="0"
                  className="input-field"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe your sweet..."
                rows="4"
                className="input-field resize-none"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image URL
              </label>
              <input
                type="url"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="input-field"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? 'Saving...' : isEditing ? 'Update Sweet' : 'Create Sweet'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
