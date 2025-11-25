import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, UsersIcon, TargetIcon, HeartIcon } from 'lucide-react';

export function AboutPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16 sm:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl sm:text-5xl font-bold mb-4">About Hovallo</h1>
                        <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                            Connecting property seekers with landlords across Nigeria
                        </p>
                    </div>
                </div>
            </div>

            {/* Mission Section */}
            <div className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                            Hovallo was created to simplify the real estate experience in Nigeria.
                            We believe finding a home or listing a property should be straightforward,
                            transparent, and accessible to everyone. Our platform connects landlords,
                            agents, and property seekers directly, eliminating unnecessary middlemen
                            and making the process more efficient.
                        </p>
                    </div>
                </div>
            </div>

            {/* Values Section */}
            <div className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HomeIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Simplicity</h3>
                            <p className="text-gray-600">
                                We make property search and listing as simple as possible
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <UsersIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Community</h3>
                            <p className="text-gray-600">
                                Building a trusted community of property owners and seekers
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <TargetIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Transparency</h3>
                            <p className="text-gray-600">
                                Clear pricing, honest listings, and direct communication
                            </p>
                        </div>
                        <div className="text-center">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <HeartIcon className="w-8 h-8 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Reliability</h3>
                            <p className="text-gray-600">
                                Dependable platform you can trust for your property needs
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 bg-blue-600">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Started?</h2>
                    <p className="text-xl text-blue-100 mb-8">
                        Join thousands of users finding their perfect property
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link
                            to="/properties"
                            className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            Browse Properties
                        </Link>
                        <Link
                            to="/signup"
                            className="px-8 py-3 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border-2 border-white"
                        >
                            Sign Up Now
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
