import React from 'react';
import { ChevronDown, ChevronUp, HelpCircle, Search, Home, DollarSign, Key, User } from 'lucide-react';

export function FAQPage() {
    const [openSection, setOpenSection] = React.useState<string | null>('getting-started');

    const toggleSection = (section: string) => {
        setOpenSection(openSection === section ? null : section);
    };

    const sections = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: <HelpCircle className="w-6 h-6 text-blue-600" />,
            questions: [
                {
                    q: 'How do I create an account?',
                    a: 'Click the "Sign In" button in the top right corner, then select "Sign up" at the bottom of the form. You can register as a Tenant, Landlord, or Agent depending on your needs.'
                },
                {
                    q: 'Is Hovallo free to use?',
                    a: 'Yes! Browsing listings and creating a tenant account is completely free. Landlords and Agents may have premium features available for listing management.'
                },
                {
                    q: 'How do I reset my password?',
                    a: 'On the login page, click the "Forgot password?" link. Enter your email address, and we will send you instructions to reset your password.'
                }
            ]
        },
        {
            id: 'buying',
            title: 'Buying a Home',
            icon: <Search className="w-6 h-6 text-green-600" />,
            questions: [
                {
                    q: 'How do I search for properties?',
                    a: 'Use the search bar on the homepage to enter a city, neighborhood, or zip code. You can filter results by price, beds, baths, and property type.'
                },
                {
                    q: 'How do I contact an agent?',
                    a: 'On any property listing page, you will see a "Contact Agent" form. Fill out your details and message, and the listing agent will get back to you.'
                },
                {
                    q: 'What is the "Mortgage Calculator"?',
                    a: 'Our mortgage calculator helps you estimate your monthly payments based on the home price, down payment, interest rate, and loan term.'
                }
            ]
        },
        {
            id: 'selling',
            title: 'Selling Your Home',
            icon: <DollarSign className="w-6 h-6 text-purple-600" />,
            questions: [
                {
                    q: 'How do I list my property?',
                    a: 'You need a Landlord or Agent account to list properties. Once logged in, go to your Dashboard and click "Add New Listing".'
                },
                {
                    q: 'How long does it take for my listing to appear?',
                    a: 'Listings are usually approved and published within 24 hours after submission.'
                },
                {
                    q: 'Can I edit my listing after posting?',
                    a: 'Yes, you can edit your listings at any time from your Dashboard under the "My Listings" section.'
                }
            ]
        },
        {
            id: 'renting',
            title: 'Renting',
            icon: <Key className="w-6 h-6 text-orange-600" />,
            questions: [
                {
                    q: 'How do I apply for a rental?',
                    a: 'Each rental listing has specific application instructions provided by the landlord or property manager. Contact them directly through the listing page.'
                },
                {
                    q: 'Can I save properties I like?',
                    a: 'Yes! Click the heart icon on any listing to save it to your Favorites. You can view all your saved homes in your Dashboard.'
                }
            ]
        },
        {
            id: 'account',
            title: 'Account Management',
            icon: <User className="w-6 h-6 text-indigo-600" />,
            questions: [
                {
                    q: 'How do I update my profile?',
                    a: 'Go to your Dashboard and look for the "Profile Settings" option to update your contact information and preferences.'
                },
                {
                    q: 'How do I delete my account?',
                    a: 'Please contact our support team at support@hovallo.com if you wish to permanently delete your account.'
                }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help you?</h1>
                    <p className="text-xl text-gray-600">
                        Find answers to common questions and learn how to get the most out of Hovallo.
                    </p>
                </div>

                <div className="space-y-6">
                    {sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-gray-100 rounded-lg">
                                        {section.icon}
                                    </div>
                                    <h2 className="text-xl font-semibold text-gray-900">{section.title}</h2>
                                </div>
                                {openSection === section.id ? (
                                    <ChevronUp className="w-5 h-5 text-gray-500" />
                                ) : (
                                    <ChevronDown className="w-5 h-5 text-gray-500" />
                                )}
                            </button>

                            {openSection === section.id && (
                                <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                                    <div className="space-y-6">
                                        {section.questions.map((item, index) => (
                                            <div key={index} className="pl-14">
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">{item.q}</h3>
                                                <p className="text-gray-600 leading-relaxed">{item.a}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center bg-blue-50 rounded-xl p-8 border border-blue-100">
                    <h3 className="text-xl font-semibold text-blue-900 mb-2">Still have questions?</h3>
                    <p className="text-blue-700 mb-6">
                        Can't find the answer you're looking for? Our support team is here to help.
                    </p>
                    <a
                        href="mailto:support@hovallo.com"
                        className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                    >
                        Contact Support
                    </a>
                </div>
            </div>
        </div>
    );
}
