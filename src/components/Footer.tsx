import React from 'react';
import { Link } from 'react-router-dom';
import { FacebookIcon, TwitterIcon, InstagramIcon, LinkedinIcon, MailIcon, PhoneIcon, MapPinIcon } from 'lucide-react';
import logoBlue from '../imgs/logo-blue.png';

export function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                            <img src={logoBlue} alt="Hovallo" className="h-10 w-auto" />
                            <span className="text-xl font-bold text-white">Hovallo</span>
                        </div>
                        <p className="text-sm text-gray-400">
                            Your trusted partner in finding the perfect property. We make real estate simple, transparent, and efficient.
                        </p>
                        <div className="flex space-x-4 pt-2">
                            <a href="#" className="hover:text-blue-500 transition-colors"><FacebookIcon className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-blue-400 transition-colors"><TwitterIcon className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-pink-500 transition-colors"><InstagramIcon className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-blue-600 transition-colors"><LinkedinIcon className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li><Link to="/" className="hover:text-blue-500 transition-colors">Home</Link></li>
                            <li><Link to="/search" className="hover:text-blue-500 transition-colors">Browse Properties</Link></li>
                            <li><Link to="/create-listing" className="hover:text-blue-500 transition-colors">List a Property</Link></li>
                            <li><Link to="/dashboard" className="hover:text-blue-500 transition-colors">Dashboard</Link></li>
                            <li><Link to="/about" className="hover:text-blue-500 transition-colors">About Us</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex items-start space-x-3">
                                <MapPinIcon className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                                <span>123 Uyo, Akwaibom State, Nigeria</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <PhoneIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                <span>+234 903 758 3286</span>
                            </li>
                            <li className="flex items-center space-x-3">
                                <MailIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />
                                <span>hello@thescotts.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Newsletter</h3>
                        <p className="text-sm text-gray-400 mb-4">Subscribe to get the latest property updates and news.</p>
                        <form className="space-y-2" onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-500"
                            />
                            <button
                                type="submit"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
                    <p>&copy; {new Date().getFullYear()} Hovallo. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
