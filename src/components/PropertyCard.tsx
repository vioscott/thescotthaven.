import { Link } from 'react-router-dom';
import { BedIcon, BathIcon, SquareIcon, MapPinIcon } from 'lucide-react';
import { StoredProperty } from '../utils/storage';
import { FavoriteButton } from './FavoriteButton';
import { VerifiedBadge } from './VerifiedBadge';

interface PropertyCardProps {
  property: StoredProperty;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const pricePerSqft = property.sqft > 0 ? Math.round(property.price / property.sqft) : 0;

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group block bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      {/* Image Container with Overlay */}
      <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-200">
        <img
          src={property.images[0]}
          alt={property.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {/* Price Badge */}
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold shadow-lg backdrop-blur-sm bg-opacity-95">
          ₦{property.price.toLocaleString()}
        </div>
        {/* Property Type Badge */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-lg text-xs font-medium capitalize shadow-md">
            {property.type}
          </div>
          {property.ownership_verified && (
            <div className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg shadow-md flex items-center justify-center">
              <VerifiedBadge size="small" verificationType="property" />
            </div>
          )}
        </div>
        {/* Favorite Button */}
        <div className="absolute bottom-4 right-4" onClick={(e) => e.preventDefault()}>
          <FavoriteButton propertyId={property.id} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
          {property.title}
        </h3>

        <p className="text-sm text-gray-600 mb-3 flex items-center">
          <MapPinIcon className="w-4 h-4 mr-1.5 text-gray-400" />
          {property.city}, {property.state}
        </p>

        {/* Price per sqft */}
        {pricePerSqft > 0 && (
          <p className="text-sm text-gray-500 mb-3">
            ₦{pricePerSqft.toLocaleString()}/sqft
          </p>
        )}

        {/* Property Features */}
        <div className="flex items-center gap-3 sm:gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <BedIcon className="w-4 h-4" />
            <span className="font-medium">{property.bedrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <BathIcon className="w-4 h-4" />
            <span className="font-medium">{property.bathrooms}</span>
          </div>
          <div className="flex items-center gap-1.5 hover:text-blue-600 transition-colors">
            <SquareIcon className="w-4 h-4" />
            <span className="font-medium">{property.sqft} sqft</span>
          </div>
        </div>
      </div>
    </Link>
  );
}