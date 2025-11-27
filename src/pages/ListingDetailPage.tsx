import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BedIcon, BathIcon, SquareIcon, ArrowLeftIcon, ShareIcon, HeartIcon, MessageSquare } from 'lucide-react';
import { storage, StoredProperty } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { ChatService } from '../utils/ChatService';

export function ListingDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [property, setProperty] = useState<StoredProperty | null>(null);
    const [activeImage, setActiveImage] = useState(0);
    const { user } = useAuth();

    // Contact Form State
    const [message, setMessage] = useState('');
    const [inquirySent, setInquirySent] = useState(false);

    useEffect(() => {
        const fetchProperty = async () => {
            if (id) {
                const found = await storage.getProperty(id);
                if (found) {
                    setProperty(found);
                }
            }
        };
        fetchProperty();
    }, [id]);

    const navigate = useNavigate();

    const handleMessageHost = async () => {
        if (!property || !user) return;

        try {
            // Create conversation with property owner
            const conversationId = await ChatService.createConversation(user.id, property.userId, property.id);

            // Navigate to messages page with this conversation selected (logic to be handled in MessagesPage or via URL param if we added that)
            // For now, just go to messages page, user will see the new conversation at top
            navigate('/messages');
        } catch (error) {
            console.error('Error starting conversation:', error);
            alert('Failed to start conversation. Please try again.');
        }
    };

    const handleContact = async (e: React.FormEvent) => {
        e.preventDefault();
        // ... (legacy inquiry logic kept for fallback if needed, though UI is hidden)
    };

    if (!property) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Link to="/" className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6">
                    <ArrowLeftIcon className="w-4 h-4 mr-2" />
                    Back to Listings
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                            <div className="aspect-video relative">
                                <img
                                    src={property.images[activeImage]}
                                    alt={property.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="p-4 flex gap-4 overflow-x-auto">
                                {property.images.map((img, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setActiveImage(idx)}
                                        className={`flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-colors ${activeImage === idx ? 'border-blue-600' : 'border-transparent'
                                            }`}
                                    >
                                        <img src={img} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Details */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
                                    <div className="flex items-center text-gray-600">
                                        <BedIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bedrooms</p>
                                        <p className="font-semibold">{property.bedrooms}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                        <BathIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Bathrooms</p>
                                        <p className="font-semibold">{property.bathrooms}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                                        <SquareIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Square Area</p>
                                        <p className="font-semibold">{property.sqft.toLocaleString()} sqft</p>
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-semibold mb-4">Description</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                {property.description}
                            </p>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Card */}
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-6">
                            <h3 className="text-lg font-semibold mb-4">Contact Landlord</h3>


                            {inquirySent ? (
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4">
                                    Message sent successfully! The landlord will contact you soon.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {!user && (
                                        <div className="bg-yellow-50 text-yellow-800 p-3 rounded text-sm mb-2">
                                            Please <Link to="/login" className="underline font-medium">log in</Link> to contact the owner.
                                        </div>
                                    )}

                                    <button
                                        onClick={handleMessageHost}
                                        disabled={!user}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        <MessageSquare className="w-5 h-5" />
                                        Message Host
                                    </button>

                                    <p className="text-xs text-center text-gray-500">
                                        Start a real-time conversation with the property owner.
                                    </p>
                                </div>
                            )}

                            <div className="mt-6 pt-6 border-t border-gray-100">
                                <button className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors mb-3">
                                    <HeartIcon className="w-4 h-4" />
                                    Save Property
                                </button>
                                <button className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-gray-900 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <ShareIcon className="w-4 h-4" />
                                    Share Listing
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
