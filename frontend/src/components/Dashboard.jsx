import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllSweets, searchSweets, deleteSweet } from '../services/sweetService';
import SweetCard from './SweetCard';

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });

  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchSweets = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getAllSweets();
        setSweets(data);
        setFilteredSweets(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSweets();
  }, [isAuthenticated, navigate]);

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      const filters = {};

      if (searchQuery) {
        filters.name = searchQuery;
      }

      if (selectedCategory) {
        filters.category = selectedCategory;
      }

      if (priceRange.min) {
        filters.minPrice = parseFloat(priceRange.min);
      }

      if (priceRange.max) {
        filters.maxPrice = parseFloat(priceRange.max);
      }

      if (Object.keys(filters).length === 0) {
        setFilteredSweets(sweets);
      } else {
        const results = await searchSweets(filters);
        setFilteredSweets(results);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = (updatedSweet) => {
    const updated = sweets.map((s) =>
      s._id === updatedSweet._id ? updatedSweet : s
    );
    setSweets(updated);
    setFilteredSweets(
      filteredSweets.map((s) =>
        s._id === updatedSweet._id ? updatedSweet : s
      )
    );
  };

  const handleEdit = (sweet) => {
    navigate(`/admin/edit/${sweet._id}`, { state: { sweet } });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this sweet?')) {
      return;
    }

    try {
      await deleteSweet(id);
      const updated = sweets.filter((s) => s._id !== id);
      setSweets(updated);
      setFilteredSweets(filteredSweets.filter((s) => s._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const categories = [...new Set(sweets.map((s) => s.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Kata Sweet Shop</h1>
            <p className="text-gray-600 mt-1">Welcome, {user?.name}!</p>
          </div>
          <div className="flex gap-4">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin/create')}
                className="btn-primary"
              >
                + Add Sweet
              </button>
            )}
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container section">
        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Search & Filter</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Search by Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kaju Katli"
                className="input-field"
              />
            </div>

            {/* Filter by Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Min Price
              </label>
              <input
                type="number"
                value={priceRange.min}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, min: e.target.value })
                }
                placeholder="₹0"
                className="input-field"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Price
              </label>
              <input
                type="number"
                value={priceRange.max}
                onChange={(e) =>
                  setPriceRange({ ...priceRange, max: e.target.value })
                }
                placeholder="₹100"
                className="input-field"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={handleSearch} className="btn-primary">
              Search
            </button>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('');
                setPriceRange({ min: '', max: '' });
                setFilteredSweets(sweets);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading sweets...</p>
          </div>
        )}

        {/* Sweets Grid */}
        {!loading && filteredSweets.length > 0 && (
          <>
            <p className="text-gray-600 mb-4">
              Showing {filteredSweets.length} sweet{filteredSweets.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredSweets.map((sweet) => (
                <SweetCard
                  key={sweet._id}
                  sweet={sweet}
                  onPurchase={handlePurchase}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          </>
        )}

        {/* No Results */}
        {!loading && filteredSweets.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm p-8">
            <p className="text-gray-600 text-lg mb-4">
              {sweets.length === 0 
                ? 'No sweets available yet' 
                : 'No sweets found matching your search'}
            </p>
            {sweets.length === 0 && (
              <>
                {isAdmin ? (
                  <p className="text-gray-500 mb-4">
                    You are an admin. Click the "+ Add Sweet" button above to add your first sweet!
                  </p>
                ) : (
                  <div className="text-gray-500">
                    <p className="mb-2">You are logged in as a regular user.</p>
                    <p className="mb-4">Only admins can add sweets to the shop.</p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4 text-left max-w-md mx-auto">
                      <p className="text-sm font-semibold text-blue-800 mb-2">To become an admin:</p>
                      <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                        <li>Open a terminal in the backend folder</li>
                        <li>Run: <code className="bg-blue-100 px-2 py-1 rounded">node src/utils/makeAdmin.js your-email@example.com</code></li>
                        <li>Logout and login again to see admin features</li>
                      </ol>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
