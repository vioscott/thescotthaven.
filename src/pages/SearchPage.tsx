import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PropertyCard } from '../components/PropertyCard';
import { AdvancedFilters } from '../components/AdvancedFilters';
import { storage, StoredProperty } from '../utils/storage';

export function SearchPage() {
    const [searchParams] = useSearchParams();
    const [properties, setProperties] = useState<StoredProperty[]>([]);
    const [filteredProperties, setFilteredProperties] = useState<StoredProperty[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize search term from URL parameter
    const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
    const [propertyType, setPropertyType] = useState<string>('all');
    const [priceRange, setPriceRange] = useState<string>('all');
    const [bedrooms, setBedrooms] = useState<string>('all');
    const [bathrooms, setBathrooms] = useState<string>('all');
    const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

    useEffect(() => {
        const fetchProperties = async () => {
            setLoading(true);
            const allProperties = await storage.getProperties();
            const published = allProperties.filter(p => p.status === 'published');
            setProperties(published);
            setFilteredProperties(published);
            setLoading(false);
        };
        fetchProperties();
    }, []);

    useEffect(() => {
        let filtered = [...properties];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Type filter
        if (propertyType !== 'all') {
            filtered = filtered.filter(p => p.type === propertyType);
        }

        // Price filter
        if (priceRange !== 'all') {
            const [min, max] = priceRange.split('-').map(Number);
            filtered = filtered.filter(p => {
                if (max) return p.price >= min && p.price <= max;
                return p.price >= min;
            });
        }

        // Bedrooms filter
        if (bedrooms !== 'all') {
            const minBedrooms = Number(bedrooms);
            filtered = filtered.filter(p => p.bedrooms >= minBedrooms);
        }

        // Bathrooms filter
        if (bathrooms !== 'all') {
            const minBathrooms = Number(bathrooms);
            filtered = filtered.filter(p => p.bathrooms >= minBathrooms);
        }

        // Verified Only filter
        if (verifiedOnly) {
            filtered = filtered.filter(p => p.ownership_verified);
        }

        setFilteredProperties(filtered);
    }, [searchTerm, propertyType, priceRange, bedrooms, bathrooms, verifiedOnly, properties]);

    return (
        <div className="min-h-screen bg-gray-50 pt-8 pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Find Your Home</h1>
                    <AdvancedFilters
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        propertyType={propertyType}
                        onTypeChange={setPropertyType}
                        priceRange={priceRange}
                        onPriceRangeChange={setPriceRange}
                        bedrooms={bedrooms}
                        onBedroomsChange={setBedrooms}
                        bathrooms={bathrooms}
                        onBathroomsChange={setBathrooms}
                        verifiedOnly={verifiedOnly}
                        onVerifiedOnlyChange={setVerifiedOnly}
                    />
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                                <div className="h-48 sm:h-56 bg-gray-200"></div>
                                <div className="p-5 space-y-3">
                                    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredProperties.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
                        <p className="text-gray-600 text-lg">No properties found matching your criteria.</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setPropertyType('all');
                                setPriceRange('all');
                                setBedrooms('all');
                                setBathrooms('all');
                                setVerifiedOnly(false);
                            }}
                            className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProperties.map((property) => (
                            <PropertyCard key={property.id} property={property} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
