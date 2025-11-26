import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, MessageCircleIcon, SearchIcon } from 'lucide-react';
import { PropertyCard } from '../components/PropertyCard';
import { storage, StoredProperty } from '../utils/storage';
import heroImage from '../imgs/Luxury-Real-Estate-Brands.jpg';

export function HomePage() {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<StoredProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      const allProperties = await storage.getProperties();
      const published = allProperties.filter(p => p.status === 'published');
      setProperties(published);
      setLoading(false);
    };
    fetchProperties();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/properties?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate('/properties');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center text-white py-20 sm:py-24 md:py-32"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 tracking-tight">
              Find Your Perfect Home
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto font-light">
              Discover amazing properties across Nigeria
            </p>
          </div>

          {/* Simple Search Bar */}
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter an address, zip code or neighborhood"
                className="w-full px-6 py-4 pr-16 rounded-lg text-gray-900 placeholder-gray-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
              />
              <button
                type="submit"
                className="absolute right-2 top-2 bottom-2 bg-blue-600 text-white p-3 rounded-md hover:bg-blue-700 transition-colors"
                aria-label="Search"
              >
                <SearchIcon className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Easy Search
              </h3>
              <p className="text-gray-600">
                Filter by type, price, and location to find exactly what you need.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Quick Posting
              </h3>
              <p className="text-gray-600">
                List your property in minutes with our simple form.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <MessageCircleIcon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Direct Contact
              </h3>
              <p className="text-gray-600">
                Connect with owners and renters without any middleman.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Properties */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Recent Properties
            </h2>
            <Link
              to="/properties"
              className="text-blue-600 font-medium hover:text-blue-700"
            >
              View All →
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 sm:h-56 bg-gray-200"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="flex gap-4 pt-3">
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-600 mb-4">No properties listed yet.</p>
              <Link
                to="/signup"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Be the first to post!
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(0, 6).map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}