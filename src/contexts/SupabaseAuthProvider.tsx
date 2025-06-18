import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/profile';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  signOut: () => Promise<void>;
  updateProfile: (profile: Profile) => void;
  updateCredits: (newCredits: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider = ({ children }: SupabaseAuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'REAUTHENTICATE') {
        setAuthState((prevState) => ({
          ...prevState,
          user: session?.user || null,
          session: session || null,
          isAuthenticated: session !== null,
        }));
        if (session?.user) {
          fetchProfile(session.user.id);
        } else {
          setAuthState((prevState) => ({ ...prevState, loading: false }));
        }
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          loading: false,
        });
      } else if (event === 'USER_UPDATED') {
        setAuthState((prevState) => ({
          ...prevState,
          user: session?.user || null,
          session: session || null,
        }));
        if (session?.user) {
          fetchProfile(session.user.id);
        }
      }
    });

    // Fetch initial auth state
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      setAuthState((prevState) => ({
        ...prevState,
        user: session?.user || null,
        session: session || null,
        isAuthenticated: session !== null,
      }));

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setAuthState((prevState) => ({ ...prevState, loading: false }));
      }
    }

    getInitialSession();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
      }

      setAuthState((prevState) => ({
        ...prevState,
        profile: profile || null,
        loading: false,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setAuthState((prevState) => ({ ...prevState, loading: false }));
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error.message);
      }
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const updateProfile = (profile: Profile) => {
    setAuthState((prevState) => ({ ...prevState, profile: profile }));
  };

  const updateCredits = async (newCredits: number) => {
    if (!authState.user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('user_id', authState.user.id);

      if (error) {
        console.error('Error updating credits:', error);
      } else {
        // Optimistically update the local state
        setAuthState((prevState) => ({
          ...prevState,
          profile: { ...prevState.profile!, credits: newCredits },
        }));
      }
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  const value: AuthContextType = {
    authState,
    signOut,
    updateProfile,
    updateCredits,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
