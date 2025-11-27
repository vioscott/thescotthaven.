import React, { useEffect, useState } from 'react';
import { storage, User } from '../utils/storage';
import { Search, Mail, MapPin, User as UserIcon, Building } from 'lucide-react';

export function AgentFinderPage() {
    const [agents, setAgents] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadAgents();
    }, []);

    const loadAgents = async () => {
        try {
            const data = await storage.getAgents();
            setAgents(data);
        } catch (error) {
            console.error('Error loading agents:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAgents = agents.filter(agent =>
        agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        agent.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Find a Real Estate Agent</h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Connect with top-rated local agents who can help you buy, sell, or rent your next property.
                    </p>
                </div>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by agent name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm text-lg"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : filteredAgents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAgents.map((agent) => (
                            <div key={agent.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 text-2xl font-bold overflow-hidden">
                                            {agent.avatar_url ? (
                                                <img src={agent.avatar_url} alt={agent.name} className="w-full h-full object-cover" />
                                            ) : (
                                                agent.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                                            <div className="flex items-center text-blue-600 text-sm font-medium">
                                                <Building className="w-4 h-4 mr-1" />
                                                <span>Licensed Agent</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-gray-600">
                                            <Mail className="w-4 h-4 mr-3" />
                                            <span className="text-sm">{agent.email}</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="w-4 h-4 mr-3" />
                                            <span className="text-sm">Lagos, Nigeria</span>
                                        </div>
                                        <div className="flex items-center text-gray-600">
                                            <UserIcon className="w-4 h-4 mr-3" />
                                            <span className="text-sm">Member since {new Date(agent.createdAt).getFullYear()}</span>
                                        </div>
                                    </div>

                                    <a
                                        href={`mailto:${agent.email}`}
                                        className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Contact Agent
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <UserIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No agents found</h3>
                        <p className="text-gray-500">
                            We couldn't find any agents matching "{searchTerm}". Try a different search term.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
