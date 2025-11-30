import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '../utils/supabase';
import { ChatService } from '../utils/ChatService';

// User type definition
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'landlord' | 'agent' | 'admin';
  isAdmin: boolean;
  avatar_url?: string;
  phone?: string;
  identity_verified?: boolean;
  business_verified?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, name: string, role?: 'tenant' | 'landlord' | 'agent') => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  fetchUserProfile: (userId: string, email: string) => Promise<void>;
  updateUserRole: (role: 'landlord' | 'agent') => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  createProfile: (name: string, role: 'tenant' | 'landlord' | 'agent') => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  needsProfile: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsProfile, setNeedsProfile] = useState(false);

  // Fetch or create user profile (including OAuth users)
  // Memoized to prevent recreation on every render (fixes useEffect dependency issues)
  const fetchUserProfile = useCallback(async (userId: string, email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && (error as any).code === 'PGRST116') {
        // No profile – flag as needing profile creation
        setNeedsProfile(true);
        // Set a temporary user object so we're authenticated but need profile
        setUser({ id: userId, email, name: email.split('@')[0], role: 'tenant', isAdmin: false });
      } else {
        setNeedsProfile(false);
        setUser({
          id: userId,
          email,
          name: data?.name || email.split('@')[0],
          role: data?.role || 'tenant',
          isAdmin: data.role === 'admin',
          avatar_url: data.avatar_url,
          phone: data.phone,
          identity_verified: data.identity_verified,
          business_verified: data.business_verified
        });
      }
    } catch (e) {
      console.error('Error in fetchUserProfile:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial session check and auth state listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          if (mounted) await fetchUserProfile(session.user.id, session.user.email!);
        } else {
          if (mounted) {
            setUser(null);
            setLoading(false);
          }
        }

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (!mounted) return;

          if (session?.user) {
            // Only fetch if we don't have the user or it's a different user
            setUser(prev => {
              if (prev?.id !== session.user.id) {
                fetchUserProfile(session.user.id, session.user.email!);
                return prev; // Keep current state until fetch updates it
              }
              return prev;
            });
          } else {
            setUser(null);
            setLoading(false);
          }
        });

        return () => {
          mounted = false;
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();
  }, [fetchUserProfile]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Don't fetch profile here - let onAuthStateChange handle it to avoid race conditions
      // This prevents duplicate profile fetches and state flickering

      // Send welcome message to most recent conversation
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const conversations = await ChatService.getConversations(user.id);
          if (conversations.length > 0) {
            await ChatService.sendSystemMessage(conversations[0].id, "Welcome back! 👋", user.id);
          }
        }
      } catch (err) {
        console.error('Error sending welcome message:', err);
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

        // Optimistically set user to avoid race condition with redirect
        setUser({
          id: data.user.id,
          email,
          name,
          role,
          isAdmin: false
        });
      }
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      if (user) {
        const conversations = await ChatService.getConversations(user.id);
        if (conversations.length > 0) {
          await ChatService.sendSystemMessage(conversations[0].id, "See you soon! 👋", user.id);
        }
      }
    } catch (err) {
      console.error('Error sending goodbye message:', err);
    }

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
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'Google sign‑in failed' };
    }
  };

  const updateUserRole = async (role: 'landlord' | 'agent') => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      setUser(prev => prev ? { ...prev, role } : null);
      return { success: true };
    } catch (e: any) {
      console.error('Error updating role:', e);
      return { success: false, error: e.message || 'Failed to update role' };
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      // Filter out fields that shouldn't be updated directly or don't exist in DB
      const { id, email, isAdmin, ...dbUpdates } = updates;

      const { error } = await supabase
        .from('users')
        .update(dbUpdates)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...updates } : null);
      return { success: true };
    } catch (e: any) {
      console.error('Error updating profile:', e);
      return { success: false, error: e.message || 'Failed to update profile' };
    }
  };

  const createProfile = async (name: string, role: 'tenant' | 'landlord' | 'agent') => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      const { error } = await supabase.from('users').insert([
        {
          id: user.id,
          email: user.email,
          name,
          role,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) throw error;

      // Update local state
      setUser(prev => prev ? { ...prev, name, role } : null);
      setNeedsProfile(false);

      // Send welcome message
      try {
        const conversations = await ChatService.getConversations(user.id);
        if (conversations.length > 0) {
          await ChatService.sendSystemMessage(conversations[0].id, "Welcome back! 👋", user.id);
        }
      } catch (err) {
        console.error('Error sending welcome message:', err);
      }

      return { success: true };
    } catch (e: any) {
      console.error('Error creating profile:', e);
      return { success: false, error: e.message || 'Failed to create profile' };
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
        updateUserRole,
        updateProfile,
        createProfile,
        isAuthenticated: !!user,
        isAdmin: user?.isAdmin ?? false,
        loading,
        needsProfile,
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