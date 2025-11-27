import React, { useState } from 'react';
import { GoogleOAuthButton } from '../components/GoogleOAuthButton';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BriefcaseIcon, CheckCircleIcon, XCircleIcon } from 'lucide-react';

type ProfessionalType =
    | 'agent' // Real estate agent/broker
    | 'landlord' // Landlord/Property Manager/Home Builder
    | 'mortgage_lender'
    | 'photographer';

interface ProfessionalOption {
    value: ProfessionalType;
    label: string;
    description: string;
    mappedRole: 'agent' | 'landlord';
}

const professionalOptions: ProfessionalOption[] = [
    {
        value: 'agent',
        label: 'Real Estate Agent/Broker',
        description: 'Licensed real estate professional',
        mappedRole: 'agent'
    },
    {
        value: 'landlord',
        label: 'Landlord',
        description: 'Property owner or manager',
        mappedRole: 'landlord'
    },
    {
        value: 'landlord',
        label: 'Property Manager',
        description: 'Professional property management',
        mappedRole: 'landlord'
    },
    {
        value: 'landlord',
        label: 'Home Builder',
        description: 'Construction and development',
        mappedRole: 'landlord'
    },
    {
        value: 'mortgage_lender',
        label: 'Mortgage Lender',
        description: 'Mortgage and financing professional',
        mappedRole: 'agent'
    },
    {
        value: 'photographer',
        label: 'Real Estate Photographer',
        description: 'Property photography services',
        mappedRole: 'agent'
    }
];

export function ProfessionalSignupPage() {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        professionalType: '' as ProfessionalType | '',
        company: '',
        licenseNumber: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Password validation rules
    const validatePassword = (password: string) => {
        return {
            minLength: password.length >= 8,
            hasUpperCase: /[A-Z]/.test(password),
            hasLowerCase: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };
    };

    const passwordChecks = validatePassword(formData.password);
    const isPasswordValid = Object.values(passwordChecks).every(check => check);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!formData.professionalType) {
            setError('Please select your professional type');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!isPasswordValid) {
            setError('Please meet all password requirements');
            return;
        }

        setLoading(true);

        // Map professional type to database role
        const selectedOption = professionalOptions.find(opt => opt.value === formData.professionalType);
        const role = selectedOption?.mappedRole || 'agent';

        const result = await signup(formData.email, formData.password, formData.name, role);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.error || 'Signup failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-2xl w-full">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
                        <BriefcaseIcon className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Professional Account
                    </h1>
                    <p className="text-gray-600">Join as a real estate professional</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                <p className="font-medium">{error}</p>
                                {(error.includes('taking too long') || error.includes('timeout')) && (
                                    <p className="mt-2 text-xs text-red-600">
                                        Tip: This often happens when the database is waking up. Please wait a moment and try again.
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Professional Type Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                I am a... *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {professionalOptions.map((option) => (
                                    <label
                                        key={option.label}
                                        className={`relative flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${formData.professionalType === option.value
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="professionalType"
                                            value={option.value}
                                            checked={formData.professionalType === option.value}
                                            onChange={(e) => setFormData({ ...formData, professionalType: e.target.value as ProfessionalType })}
                                            className="sr-only"
                                        />
                                        <span className="font-medium text-gray-900 text-sm">{option.label}</span>
                                        <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="John Doe"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Company/Agency
                                </label>
                                <input
                                    type="text"
                                    value={formData.company}
                                    onChange={e => setFormData({ ...formData, company: e.target.value })}
                                    placeholder="Optional"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    License Number
                                </label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={e => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    placeholder="Optional"
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />

                            {/* Password Requirements */}
                            {formData.password && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                                    <div className="space-y-1">
                                        <PasswordRequirement
                                            met={passwordChecks.minLength}
                                            text="At least 8 characters"
                                        />
                                        <PasswordRequirement
                                            met={passwordChecks.hasUpperCase}
                                            text="One uppercase letter (A-Z)"
                                        />
                                        <PasswordRequirement
                                            met={passwordChecks.hasLowerCase}
                                            text="One lowercase letter (a-z)"
                                        />
                                        <PasswordRequirement
                                            met={passwordChecks.hasNumber}
                                            text="One number (0-9)"
                                        />
                                        <PasswordRequirement
                                            met={passwordChecks.hasSpecialChar}
                                            text="One special character (!@#$%^&*)"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Confirm Password *
                            </label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
                                placeholder="••••••••"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !isPasswordValid || !formData.professionalType}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating account...' : 'Create Professional Account'}
                        </button>
                    </form>

                    <div className="mt-6 flex flex-col items-center">
                        <GoogleOAuthButton label="Sign up with Google" className="w-full max-w-sm" />
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm space-y-2">
                        <div>
                            <span className="text-gray-600">Looking for a regular account? </span>
                            <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
                                Sign up here
                            </Link>
                        </div>
                        <div>
                            <span className="text-gray-600">Already have an account? </span>
                            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                                Sign in
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Helper component for password requirements
function PasswordRequirement({ met, text }: { met: boolean; text: string }) {
    return (
        <div className="flex items-center gap-2 text-xs">
            {met ? (
                <CheckCircleIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
            ) : (
                <XCircleIcon className="w-4 h-4 text-gray-300 flex-shrink-0" />
            )}
            <span className={met ? 'text-green-700' : 'text-gray-500'}>{text}</span>
        </div>
    );
}
