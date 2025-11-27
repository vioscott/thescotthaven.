import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface GoogleOAuthButtonProps {
    /** Text displayed on the button */
    label: string;
    /** Optional CSS classes for styling */
    className?: string;
}

/**
 * A reusable button that triggers Google OAuth sign‑in via Supabase.
 * Handles loading state and displays any error returned from the auth call.
 */
export function GoogleOAuthButton({ label, className = '' }: GoogleOAuthButtonProps) {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleClick = async () => {
        setLoading(true);
        setError(null);
        const result = await signInWithGoogle();
        if (!result.success) {
            setError(result.error ?? 'Google sign‑in failed');
        }
        setLoading(false);
    };

    return (
        <div className={className}>
            <button
                type="button"
                onClick={handleClick}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        className="h-5 w-5"
                    />
                )}
                {label}
            </button>
            {error && (
                <p className="mt-2 text-center text-sm text-red-600" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}
