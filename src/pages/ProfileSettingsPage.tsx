import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User, Mail, Shield, Camera } from 'lucide-react';

export function ProfileSettingsPage() {
    const { user, updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        avatar_url: '',
    });

    // Initialize form data when user loads or edit mode starts
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                phone: user.phone || '',
                avatar_url: user.avatar_url || '',
            });
        }
    }, [user]);

    if (!user) return null;

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('File size too large. Please upload an image smaller than 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            setFormData(prev => ({ ...prev, avatar_url: base64String }));
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await updateProfile({
            name: formData.name,
            phone: formData.phone,
            avatar_url: formData.avatar_url,
        });

        setIsLoading(false);

        if (result.success) {
            setIsEditing(false);
        } else {
            alert('Failed to update profile: ' + result.error);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    // Reset form on cancel
                                    setFormData({
                                        name: user.name || '',
                                        phone: user.phone || '',
                                        avatar_url: user.avatar_url || '',
                                    });
                                }
                                setIsEditing(!isEditing);
                            }}
                            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* Profile Header */}
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-3xl font-bold overflow-hidden">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt={formData.name} className="w-full h-full object-cover" />
                                    ) : (
                                        (formData.name || user.name).charAt(0).toUpperCase()
                                    )}
                                </div>
                                {isEditing && (
                                    <label className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50 cursor-pointer">
                                        <Camera className="w-4 h-4 text-gray-600" />
                                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                    </label>
                                )}
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{user.name}</h2>
                                <p className="text-gray-500 capitalize">{user.role}</p>
                            </div>
                        </div>

                        {/* Profile Details Form */}
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        required
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <User className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-900">{user.name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200 opacity-75 cursor-not-allowed">
                                    <Mail className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900">{user.email}</span>
                                </div>
                                {isEditing && <p className="text-xs text-gray-500">Email cannot be changed</p>}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone / WhatsApp</label>
                                {isEditing ? (
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                                        placeholder="+234..."
                                        className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                ) : (
                                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                        <span className="w-5 h-5 flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-400 rounded-full">#</span>
                                        <span className={user.phone ? "text-gray-900" : "text-gray-400 italic"}>
                                            {user.phone || 'Not set'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Account Type</label>
                                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <Shield className="w-5 h-5 text-gray-400" />
                                    <span className="text-gray-900 capitalize">{user.role}</span>
                                </div>
                            </div>

                            {isEditing && (
                                <div className="md:col-span-2 flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditing(false);
                                            setFormData({ name: user.name || '', phone: user.phone || '' });
                                        }}
                                        className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                                    >
                                        {isLoading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
                        </form>

                        {/* Account Actions */}
                        <div className="pt-8 border-t border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Actions</h3>
                            <div className="space-y-4">
                                <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
