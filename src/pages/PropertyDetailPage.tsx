import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BedIcon, BathIcon, SquareIcon, MapPinIcon, ArrowLeftIcon, TrashIcon } from 'lucide-react';
import { ContactModal } from '../components/ContactModal';
import { storage, StoredProperty } from '../utils/storage';
import { trackPropertyView } from '../utils/analytics';
import { useAuth } from '../contexts/AuthContext';
export function PropertyDetailPage() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const [property, setProperty] = useState<StoredProperty | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
    if (id) {
      const foundProperty = storage.getProperties().find(p => p.id === id);
      setProperty(foundProperty || null);

      // Track property view (only if not the owner)
      if (foundProperty && (!user || user.id !== foundProperty.userId)) {
        trackPropertyView(id, {
          city: foundProperty.city,
          state: foundProperty.state
        });
      }
    }
  }, [id, user]);
  const isOwner = user && property && user.id === property.userId;
  const handleDelete = () => {
    if (property && window.confirm('Are you sure you want to delete this property?')) {
      storage.deleteProperty(property.id);
      navigate('/dashboard');
    }
  };
  if (!property) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Property not found
        </h2>
        <Link to="/properties" className="text-blue-600 hover:text-blue-700">
          ← Back to properties
        </Link>
      </div>
    </div>;
  }
  return <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/properties" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeftIcon className="w-4 h-4" />
          Back to properties
        </Link>

        {isOwner && <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
          <TrashIcon className="w-4 h-4" />
          Delete Property
        </button>}
      </div>

      <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
        <div className="relative">
          <div className="aspect-[21/9] overflow-hidden">
            <img src={property.images[currentImageIndex]} alt={property.title} className="w-full h-full object-cover" />
          </div>

          {property.images.length > 1 && <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            {property.images.map((_, index) => <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-2 h-2 rounded-full transition-all ${index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50 hover:bg-white/75'}`} />)}
          </div>}
        </div>

        <div className="p-8">
          <div className="flex items-start justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {property.title}
              </h1>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPinIcon className="w-5 h-5" />
                <span className="text-lg">{property.location}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                ${property.price.toLocaleString()}
              </div>
              <div className="text-gray-600">per month</div>
            </div>
          </div>

          <div className="flex items-center gap-6 py-6 border-y border-gray-200 mb-6">
            {property.bedrooms > 0 && <div className="flex items-center gap-2">
              <BedIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {property.bedrooms} Bedrooms
              </span>
            </div>}
            <div className="flex items-center gap-2">
              <BathIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {property.bathrooms} Bathrooms
              </span>
            </div>
            <div className="flex items-center gap-2">
              <SquareIcon className="w-5 h-5 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {property.sqft.toLocaleString()} sqft
              </span>
            </div>
            <span className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-medium rounded-full capitalize">
              {property.type}
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              Description
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {property.description}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Contact Information
            </h3>
            <div className="space-y-2 text-gray-600">
              <p>
                <span className="font-medium text-gray-900">Name:</span>{' '}
                {property.contactName}
              </p>
              <p>
                <span className="font-medium text-gray-900">Email:</span>{' '}
                {property.contactEmail}
              </p>
              <p>
                <span className="font-medium text-gray-900">Phone:</span>{' '}
                {property.contactPhone}
              </p>
            </div>
          </div>

          {!isOwner && <button onClick={() => setIsContactModalOpen(true)} className="w-full bg-blue-600 text-white py-4 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors">
            Contact Owner
          </button>}
        </div>
      </div>
    </div>

    <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} propertyTitle={property.title} contactName={property.contactName} contactEmail={property.contactEmail} contactPhone={property.contactPhone} />
  </div>;
}