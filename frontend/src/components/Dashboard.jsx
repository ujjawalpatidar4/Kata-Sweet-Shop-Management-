import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAllSweets, searchSweets, deleteSweet } from '../services/sweetService';
import SweetCard from './SweetCard';
import SearchDropdown from './SearchDropdown';
import ImageSlider from './ImageSlider';

export default function Dashboard() {
  const [sweets, setSweets] = useState([]);
  const [filteredSweets, setFilteredSweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSearch, setShowSearch] = useState(false);
  const searchInputRef = useRef(null);

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

  useEffect(() => {
    if (showSearch) {
      // Prime suggestions and open dropdown on open
      updateSuggestions(searchQuery);
      setIsDropdownOpen(true);
      setHighlightedIndex(-1);
      // Focus the input
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    } else {
      setIsDropdownOpen(false);
    }
  }, [showSearch]);

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
        // Use backend search for accuracy
        const results = await searchSweets(filters);
        setFilteredSweets(results);
      }

      // Open dropdown with current suggestions if a name is present
      updateSuggestions(searchQuery);
      setIsDropdownOpen(true);
      setHighlightedIndex(-1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSuggestions = (query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const results = sweets
      .filter((s) =>
        [s.name, s.category, s.description]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q))
      )
      .slice(0, 8);
    setSuggestions(results);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    updateSuggestions(val);
    setIsDropdownOpen(!!val);
    setHighlightedIndex(-1);
  };

  const handleSelectSuggestion = (item) => {
    // Filter to the selected sweet
    setSearchQuery(item.name);
    setFilteredSweets(sweets.filter((s) => s._id === item._id));
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e) => {
    if (!isDropdownOpen || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur shadow-sm">
        <div className="container py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Kata Sweet Shop</h1>
            <p className="text-slate-600 mt-1">Welcome, {user?.name}!</p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className={` ${showSearch ? 'ring-2 ring-amber-400' : ''}`}
              aria-label={showSearch ? 'Hide search' : 'Show search'}
              title={showSearch ? 'Hide search' : 'Show search'}
            >
              <img
                src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAMAAACahl6sAAAAbFBMVEX///8AAACPj48QEBD19fULCwv4+Pjv7+9LS0udnZ2Hh4dAQEAsLCze3t4XFxeAgIA2NjZ1dXVnZ2ekpKTCwsK5ublkZGTX19dubm4xMTEmJiawsLDr6+shISFdXV3Nzc0+Pj5JSUmhoaG0tLRpJDVIAAAEQUlEQVR4nO2b6ZKqMBCFEWURREBQdBj393/Hq2MSQFzIYqWvdb6fM5DqQ9JLktZxAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGAAyXka5YvFOo+KMrFtjCKTZZ55ozbzMC1tWyWLX4ddEULMamnbNgmS9fihihs/bmDbwGFUuxcq/vDS/0BKsH4n42+Fub5tQ99QzIfouLCpbJv6isn9qvI2uzxyp266Dn/u/xXZtvY5+46xXuh2vrpfpoeOlCNVT6nbETc+TR48kqTb1jM/NJfXtGViuH/6WDFrHhtTTJBuY9/huYwrpyYgePTSYzMf4+m7Z4NFo4TanNTCtGxIcViL1D+m5Sd74eeLYZkuEZ6ypRS7JiLupkNfCUQoDj9pmSQiD7rD3/GPCi99mEJ6Pq5MMu7wVNwk4OF0IfkeX5CHT1ilAK93M9mKtuIhoviIXbJUPJDKb8p58tmSKOq5p7/Ngw8ICfl7orPQE4/OlHAPeV1fPSMl4yX+WCutBez12KxVCtRaE9JMifXju1Dzi/4yIbY3vhPmrSflEdiXyAwapcKSVRmP9rXD4Gvz16BVCuRarn7FZ3NamzNKhUw/ocW3IXJjNinBPqdO/RpRCMAsrXs6YzA3m5uySYnzzYiNzhi8xrG65WXl605rEE8vpRohMuGo7BzC6hFXbiItZwTi70I/+or4q14cGIAJUdlTNYQEhKwNzojVLQnzEaljoB4bAj7CotZaaxB2ZWL1OLvQrhkvVeNIv8zRprzZ8KMzBj9Osnr+kBgwgm1ItsaMUmKuv77XBpanPqF+2JqZiHzasEOQg/oI/PTB8m0i83aN0xx2iaqx6zfDXHdhsHR4NGiTEivNmLMfmSjXDMA2qsqVEosWnv0rUVZgzNTe5tlQb49pBN7xoFaF8wsSAn0DAdtyz1UWBzu8sH5g+gc/T5e8Cr0y4b1CZ/NmySMudeU3FDtKE9J4ifRtqGjEsXoS1OCznDaayblJyW+nVx8yTBrRUnOQKecr3iGkFCY+Q8TXyHF4xVSJ9jNKzWdHblQ29OuWomPL8n1CF9FWMrThcioavBRLgk8hFvzIG1D+dfqDKXQ9tCibXtnwXRg+t3tmySlZNkpeN/FX4egOYkrK1m8txumzS9p9TwY9JVVnxYR1P6n8upv2IzOqSoLu1/biaCncxa/q9azz70vcdakqcdzeD5K8WRaH8WZ7//fR/JoH6SqpDj2LH7O6xQO6Spyi//H7ZKLeJazEd99Jydr7KMJKHL+In6vwdnf7c8pKHCeJsocqjtN+rqSt5JI06jxu/3RsG6bLx1U+dSVXgv2yPp2Kuqxe7bn+ByXDgBJ6QAk9oIQeUEIPKKEHlNADSugBJfSAEnpACT2ghB5QQo9vVGL5B5facCWx7XZabdwv0XFT8g06rkq+Q4fj1F+iAwAAAAAAAAAAAAAAAAAAAAAAAAAAAGCCf2V2JCIE+BmcAAAAAElFTkSuQmCC"                
                alt="Search"
                className="h-8 w-8"
              />
            </button>
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

      {/* Image Slider between header and sweets section */}
      <ImageSlider />

      {/* Main Content */}
      <main className="container section">
        {/* Search & Filter Section (toggle) */}
        {showSearch && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-slate-800">Search & Filter</h2>
            <button
              className="text-slate-500 hover:text-slate-700 text-sm"
              onClick={() => setShowSearch(false)}
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 relative">
            {/* Search by Name */}
            <div className="md:col-span-1 relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search by Name
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => {
                  updateSuggestions(searchQuery);
                  setIsDropdownOpen(!!searchQuery);
                }}
                placeholder="Kaju Katli"
                className="input-field"
                ref={searchInputRef}
              />
              <SearchDropdown
                open={isDropdownOpen}
                items={suggestions}
                highlightedIndex={highlightedIndex}
                onSelect={handleSelectSuggestion}
                onClose={() => setIsDropdownOpen(false)}
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
                setSuggestions([]);
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
              }}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        </div>
        )}

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
            <p className="text-slate-600 mb-4">
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
          <div className="text-center py-12 bg-white rounded-xl shadow-sm p-8">
            <p className="text-slate-600 text-lg mb-4">
              {sweets.length === 0 
                ? 'No sweets available yet' 
                : 'No sweets found matching your search'}
            </p>
            {sweets.length === 0 && (
              <>
                {isAdmin ? (
                  <p className="text-slate-500 mb-4">
                    You are an admin. Click the "+ Add Sweet" button above to add your first sweet!
                  </p>
                ) : (
                  <div className="text-slate-500">
                    <p className="mb-2">You are logged in as a regular user.</p>
                    <p className="mb-4">Only admins can add sweets to the shop.</p>
                    <div className="bg-sky-50 border border-sky-200 rounded-lg p-4 mt-4 text-left max-w-md mx-auto">
                      <p className="text-sm font-semibold text-sky-800 mb-2">To become an admin:</p>
                      <ol className="text-sm text-sky-700 list-decimal list-inside space-y-1">
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
