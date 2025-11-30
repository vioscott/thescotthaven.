import React, { useEffect, useState } from 'react';
import { storage, StoredProperty, User } from '../utils/storage';
import { CheckCircleIcon, XCircleIcon, TrashIcon, UserIcon, HomeIcon, ShieldCheck } from 'lucide-react';
import { AdminVerificationReview } from '../components/AdminVerificationReview';

export function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'listings' | 'users' | 'verifications'>('listings');
  const [properties, setProperties] = useState<StoredProperty[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeTab !== 'verifications') {
      fetchData();
    }
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'listings') {
        const data = await storage.getAllProperties();
        setProperties(data);
      } else if (activeTab === 'users') {
        const data = await storage.getAllUsers();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'published' | 'draft' | 'archived') => {
    if (window.confirm(`Are you sure you want to mark this listing as ${status}?`)) {
      try {
        await storage.updatePropertyStatus(id, status);
        fetchData(); // Refresh list
      } catch (error) {
        console.error('Error updating status:', error);
        alert('Failed to update status');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this listing?')) {
      try {
        await storage.deleteProperty(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting property:', error);
        alert('Failed to delete property');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Manage listings, users, and verifications</p>
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('listings')}
            className={`pb-4 px-2 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'listings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center space-x-2">
              <HomeIcon className="w-4 h-4" />
              <span>Listings</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`pb-4 px-2 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'users'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center space-x-2">
              <UserIcon className="w-4 h-4" />
              <span>Users</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`pb-4 px-2 font-medium text-sm transition-colors relative whitespace-nowrap ${activeTab === 'verifications'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Verifications</span>
            </div>
          </button>
        </div>

        {/* Content */}
        {activeTab === 'verifications' ? (
          <AdminVerificationReview />
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : activeTab === 'listings' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Owner ID</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {properties.map((property) => (
                      <tr key={property.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            {property.images[0] && (
                              <img
                                src={property.images[0]}
                                alt=""
                                className="h-10 w-10 rounded-lg object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="font-medium text-gray-900">{property.title}</div>
                              <div className="text-sm text-gray-500">{property.city}, {property.state}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 font-mono text-xs">
                          {property.userId.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${property.status === 'published'
                            ? 'bg-green-100 text-green-800'
                            : property.status === 'draft'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {property.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(property.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            {property.status !== 'published' && (
                              <button
                                onClick={() => handleUpdateStatus(property.id, 'published')}
                                className="text-green-600 hover:text-green-900"
                                title="Approve / Publish"
                              >
                                <CheckCircleIcon className="w-5 h-5" />
                              </button>
                            )}
                            {property.status === 'published' && (
                              <button
                                onClick={() => handleUpdateStatus(property.id, 'draft')}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Unpublish / Draft"
                              >
                                <XCircleIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(property.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {properties.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                          No listings found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold mr-3">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin'
                            ? 'bg-purple-100 text-purple-800'
                            : user.role === 'landlord'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {users.length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          No users found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}