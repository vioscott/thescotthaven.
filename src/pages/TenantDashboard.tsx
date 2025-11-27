import { Link } from 'react-router-dom';
import { Heart, History, Search, Bell, TrendingUp, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function TenantDashboard() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
                    <p className="text-gray-600 mt-2">Find your perfect property</p>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link
                        to="/properties"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Search className="w-6 h-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="font-semibold text-gray-900">Search Properties</h3>
                                <p className="text-sm text-gray-500">Browse available listings</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/favorites"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-red-100 rounded-lg">
                                <Heart className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="font-semibold text-gray-900">My Favorites</h3>
                                <p className="text-sm text-gray-500">View saved properties</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/mortgage"
                        className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-200"
                    >
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <h3 className="font-semibold text-gray-900">Mortgage Calculator</h3>
                                <p className="text-sm text-gray-500">Calculate payments</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recently Viewed */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <History className="w-5 h-5 text-gray-400 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Recently Viewed</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-500 text-center py-8">
                                No recently viewed properties yet. Start browsing to see your history here.
                            </p>
                            <Link
                                to="/properties"
                                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Browse Properties
                            </Link>
                        </div>
                    </div>

                    {/* Saved Searches */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="flex items-center">
                                <Bell className="w-5 h-5 text-gray-400 mr-2" />
                                <h2 className="text-lg font-semibold text-gray-900">Saved Searches</h2>
                            </div>
                        </div>
                        <div className="p-6">
                            <p className="text-gray-500 text-center py-8">
                                Save your search criteria to get notified about new listings.
                            </p>
                            <Link
                                to="/properties"
                                className="block w-full text-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                            >
                                Create Search Alert
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recommended Properties */}
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center">
                            <MapPin className="w-5 h-5 text-gray-400 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900">Recommended For You</h2>
                        </div>
                    </div>
                    <div className="p-6">
                        <p className="text-gray-500 text-center py-8">
                            We'll show personalized property recommendations based on your preferences.
                        </p>
                        <Link
                            to="/properties"
                            className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            Explore Properties
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
