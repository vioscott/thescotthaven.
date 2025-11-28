import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallbackPage() {
    const navigate = useNavigate();
    const { fetchUserProfile } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const handleAuthCallback = async () => {
            try {
                // Get the session from the URL hash or query params
                const { data: { session }, error } = await supabase.auth.getSession();

                if (error) throw error;

                if (session?.user) {
                    // Ensure user profile exists
                    await fetchUserProfile(session.user.id, session.user.email!);

                    // Redirect to dashboard
                    navigate('/dashboard');
                } else {
                    // If no session found, check if we have an error in URL
                    const params = new URLSearchParams(window.location.search);
                    const errorDescription = params.get('error_description');
                    if (errorDescription) {
                        throw new Error(errorDescription);
                    }

                    // Fallback to login if no session and no specific error
                    navigate('/login');
                }
            } catch (err: any) {
                console.error('Error during auth callback:', err);
                setError(err.message || 'Authentication failed');
                // Redirect to login after a delay
                setTimeout(() => navigate('/login'), 3000);
            }
        };

        handleAuthCallback();
        // fetchUserProfile is now memoized with useCallback, safe to omit from dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [navigate]);

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Error</h2>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <p className="text-sm text-gray-500">Redirecting to login...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Completing sign in...</p>
            </div>
        </div>
    );
}
