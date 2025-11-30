import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';

interface AdvancedFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    propertyType: string;
    onTypeChange: (value: string) => void;
    priceRange: string;
    onPriceRangeChange: (value: string) => void;
    bedrooms: string;
    onBedroomsChange: (value: string) => void;
    bathrooms: string;
    onBathroomsChange: (value: string) => void;
    verifiedOnly: boolean;
    onVerifiedOnlyChange: (value: boolean) => void;
    className?: string;
}

export function AdvancedFilters({
    searchTerm,
    onSearchChange,
    propertyType,
    onTypeChange,
    priceRange,
    onPriceRangeChange,
    bedrooms,
    onBedroomsChange,
    bathrooms,
    onBathroomsChange,
    verifiedOnly,
    onVerifiedOnlyChange,
    className = ''
}: AdvancedFiltersProps) {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const clearFilters = () => {
        onSearchChange('');
        onTypeChange('all');
        onPriceRangeChange('all');
        onBedroomsChange('all');
        onBathroomsChange('all');
        onVerifiedOnlyChange(false);
    };

    const hasActiveFilters = searchTerm || propertyType !== 'all' || priceRange !== 'all' ||
        bedrooms !== 'all' || bathrooms !== 'all' || verifiedOnly;

    return (
        <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
            {/* Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
                {/* Search Input */}
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by location or title..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {/* Type Filter */}
                <select
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    value={propertyType}
                    onChange={(e) => onTypeChange(e.target.value)}
                >
                    <option value="all">All Types</option>
                    <option value="apartment">Apartment</option>
                    <option value="house">House</option>
                    <option value="condo">Condo</option>
                    <option value="studio">Studio</option>
                    <option value="office">Office</option>
                    <option value="land">Land</option>
                </select>

                {/* Price Filter */}
                <select
                    className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                    value={priceRange}
                    onChange={(e) => onPriceRangeChange(e.target.value)}
                >
                    <option value="all">All Prices</option>
                    <option value="0-500000">Under ₦500k</option>
                    <option value="500000-1000000">₦500k - ₦1M</option>
                    <option value="1000000-5000000">₦1M - ₦5M</option>
                    <option value="5000000-10000000">₦5M - ₦10M</option>
                    <option value="10000000-999999999">₦10M+</option>
                </select>
            </div>

            {/* Advanced Filters Toggle */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {showAdvanced ? 'Hide' : 'Show'} Advanced Filters
                </button>

                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="flex items-center gap-1 text-gray-600 hover:text-gray-900 text-sm"
                    >
                        <X className="w-4 h-4" />
                        Clear All
                    </button>
                )}
            </div>

            {/* Advanced Filters Panel */}
            {showAdvanced && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Bedrooms Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bedrooms
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                value={bedrooms}
                                onChange={(e) => onBedroomsChange(e.target.value)}
                            >
                                <option value="all">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                                <option value="5">5+</option>
                            </select>
                        </div>

                        {/* Bathrooms Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Bathrooms
                            </label>
                            <select
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white"
                                value={bathrooms}
                                onChange={(e) => onBathroomsChange(e.target.value)}
                            >
                                <option value="all">Any</option>
                                <option value="1">1+</option>
                                <option value="2">2+</option>
                                <option value="3">3+</option>
                                <option value="4">4+</option>
                            </select>
                        </div>
                    </div>

                    {/* Verified Only Toggle */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={verifiedOnly}
                                onChange={(e) => onVerifiedOnlyChange(e.target.checked)}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Show Verified Properties Only</span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
