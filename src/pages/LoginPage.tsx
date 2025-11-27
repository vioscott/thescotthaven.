import React, { useState } from 'react';
import { GoogleOAuthButton } from '../components/GoogleOAuthButton';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { LogInIcon } from 'lucide-react';
export function LoginPage() {
  const navigate = useNavigate();
  const {
    login
  } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        // Ensure we capture any error message from the auth call
        const errMsg = result.error || 'Login failed. Please check your credentials.';
        setError(errMsg);
        console.error('Login error:', errMsg);
      }
    } catch (e: any) {
      const errMsg = e.message || 'An unexpected error occurred during login.';
      setError(errMsg);
      console.error('Unexpected login exception:', errMsg);
    } finally {
      setLoading(false);
    }
  };
  return <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
    <div className="max-w-md w-full">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
          <LogInIcon className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-600">Sign in to manage your properties</p>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
              Forgot password?
            </Link>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="mt-6 flex flex-col items-center space-y-4">
          <GoogleOAuthButton label="Sign in with Google" className="w-full max-w-sm" />

        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm">
          <span className="text-gray-600">Don't have an account? </span>
          <Link to="/signup" className="text-blue-600 hover:text-blue-700 font-medium">
            Sign up
          </Link>
        </div>

        {/* <div className="mt-4 p-4 bg-blue-50 rounded-lg text-sm text-gray-700">
            <p className="font-medium mb-1">Demo Credentials:</p>
            <p>Admin: admin@propertyhub.com / admin123</p>
          </div> */}
      </div>
    </div>
  </div>;
}