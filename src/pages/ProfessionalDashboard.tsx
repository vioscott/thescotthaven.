import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusIcon, EditIcon, TrashIcon, EyeIcon, BarChart3, TrendingUp, Users, Home } from 'lucide-react';
import { storage, StoredProperty } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export function ProfessionalDashboard() {
    const { user } = useAuth();
    const [myProperties, setMyProperties] = useState<StoredProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        draft: 0,
        archived: 0
    });

    useEffect(() => {
        const fetchProperties = async () => {
            if (user) {
                try {
                    const props = await storage.getUserProperties(user.id);
                    setMyProperties(props);

                    // Calculate stats
                    setStats({
                        total: props.length,
                        published: props.filter(p => p.status === 'published').length,
                        draft: props.filter(p => p.status === 'draft').length,
                        archived: props.filter(p => p.status === 'archived').length
                    });
                } catch (error) {
                    console.error('Error fetching properties:', error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProperties();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await storage.deleteProperty(id);
                if (user) {
                    const props = await storage.getUserProperties(user.id);
                    setMyProperties(props);

                    // Recalculate stats
                    setStats({
                        total: props.length,
                        published: props.filter(p => p.status === 'published').length,
                        draft: props.filter(p => p.status === 'draft').length,
                        archived: props.filter(p => p.status === 'archived').length
                    });
                }
            } catch (error) {
                console.error('Error deleting property:', error);
                alert('Failed to delete property');
            }
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Professional Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage your listings and track performance</p>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            to="/dashboard/analytics"
                            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
                        >
                            <BarChart3 className="w-5 h-5 mr-2" />
                            Portfolio Analytics
                        </Link>
                        <Link
                            to="/create-listing"
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            New Listing
                        </Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Listings</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Home className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Published</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">{stats.published}</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <TrendingUp className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Draft</p>
                                <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.draft}</p>
                            </div>
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <EditIcon className="w-6 h-6 text-yellow-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Views</p>
                                <p className="text-2xl font-bold text-purple-600 mt-1">-</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <Users className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Listings Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">My Listings</h2>
                    </div>

                    {loading ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500">Loading your listings...</p>
                        </div>
                    ) : myProperties.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 mb-4">You haven't posted any properties yet.</p>
                            <Link
                                to="/create-listing"
                                className="text-blue-600 font-medium hover:text-blue-700"
                            >
                                Create your first listing →
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {myProperties.map((property) => (
                                        <tr key={property.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center">
                                                    {property.images && property.images.length > 0 ? (
                                                        <img
                                                            src={property.images[0]}
                                                            alt=""
                                                            className="h-10 w-10 rounded-lg object-cover mr-3"
                                                        />
                                                    ) : (
                                                        <div className="h-10 w-10 rounded-lg bg-gray-200 mr-3 flex items-center justify-center">
                                                            <Home className="w-5 h-5 text-gray-400" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <div className="font-medium text-gray-900">{property.title}</div>
                                                        <div className="text-sm text-gray-500">{property.city}, {property.state}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${property.status === 'published'
                                                        ? 'bg-green-100 text-green-800'
                                                        : property.status === 'draft'
                                                            ? 'bg-yellow-100 text-yellow-800'
                                                            : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {property.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {property.currency === 'NGN' ? '₦' : '$'}{property.price.toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500">
                                                {new Date(property.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-3">
                                                    <Link
                                                        to={`/properties/${property.id}`}
                                                        className="text-gray-400 hover:text-blue-600"
                                                        title="View"
                                                    >
                                                        <EyeIcon className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        to={`/dashboard/properties/${property.id}/analytics`}
                                                        className="text-gray-400 hover:text-purple-600"
                                                        title="Analytics"
                                                    >
                                                        <BarChart3 className="w-4 h-4" />
                                                    </Link>
                                                    <Link
                                                        to={`/properties/${property.id}/edit`}
                                                        className="text-gray-400 hover:text-blue-600"
                                                        title="Edit"
                                                    >
                                                        <EditIcon className="w-4 h-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(property.id)}
                                                        className="text-gray-400 hover:text-red-600"
                                                        title="Delete"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
