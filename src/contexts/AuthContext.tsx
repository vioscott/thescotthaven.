import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

// User type definition
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'agent' | 'admin';
  isAdmin: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role?: 'tenant' | 'landlord' | 'agent') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  fetchUserProfile: (userId: string, email: string) => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch or create user profile (including OAuth users)
  const fetchUserProfile = async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && (error as any).code === 'PGRST116') {
        // No profile – create a default one using OAuth info
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: userId,
            email,
            name: email.split('@')[0],
            role: 'tenant',
            created_at: new Date().toISOString(),
          },
        ]);
        if (insertError) console.error('Error creating OAuth profile:', insertError);
        setUser({ id: userId, email, name: email.split('@')[0], role: 'tenant', isAdmin: false });
      } else {
        setUser({
          id: userId,
          email,
          name: data?.name || email.split('@')[0],
          role: data?.role || 'tenant',
          isAdmin: data?.role === 'admin',
          avatar_url: data?.avatar_url,
        });
      }
    } catch (e) {
      console.error('Error in fetchUserProfile:', e);
    } finally {
      setLoading(false);
    }
  };

  // Initial session check and auth state listener
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!);
      } else {
        setLoading(false);
      }
    };
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email!);
      } else {
        setUser(null);
        setLoading(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        await fetchUserProfile(data.user.id, data.user.email!);
      }

      return { success: true };
    } catch (e: any) {
      console.error('Login error:', e);
      return { success: false, error: e.message || 'Login failed' };
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'tenant' | 'landlord' | 'agent' = 'tenant') => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role } },
      });
      if (error) throw error;
      if (data?.user) {
        const { error: profileError } = await supabase.from('users').insert([
          { id: data.user.id, email, name, role, created_at: new Date().toISOString() },
        ]);
        if (profileError) console.error('Error creating user profile:', profileError);
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Google sign‑in failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        logout,
        resetPassword,
        signInWithGoogle,
        fetchUserProfile,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}