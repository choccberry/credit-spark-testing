import React, { useState, useEffect, ReactNode, createContext, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  username?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  credits: number;
  created_at: string;
  updated_at: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;
}

interface AuthContextType {
  authState: AuthState;
  signUp: (email: string, password: string, username?: string, displayName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
  updateCredits: (newBalance: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within a SupabaseAuthProvider');
  }
  return context;
};

interface SupabaseAuthProviderProps {
  children: ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isAuthenticated: false,
    loading: true,
  });
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          setAuthState({
            user: session.user,
            profile,
            session,
            isAuthenticated: true,
            loading: false,
          });
        } else {
          setAuthState({
            user: null,
            profile: null,
            session: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then((profile) => {
          setAuthState({
            user: session.user,
            profile,
            session,
            isAuthenticated: true,
            loading: false,
          });
        });
      } else {
        setAuthState({
          user: null,
          profile: null,
          session: null,
          isAuthenticated: false,
          loading: false,
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username?: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          username,
          display_name: displayName,
        }
      }
    });

    if (!error) {
      toast({
        title: 'Check your email',
        description: 'We sent you a confirmation link to complete your registration.',
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!authState.user) {
      return { error: new Error('No user logged in') };
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', authState.user.id);

    if (!error && authState.profile) {
      setAuthState(prev => ({
        ...prev,
        profile: { ...prev.profile!, ...updates }
      }));
    }

    return { error };
  };

  const updateCredits = async (newBalance: number) => {
    if (!authState.user || !authState.profile) return;

    const { error } = await supabase
      .from('profiles')
      .update({ credits: newBalance })
      .eq('user_id', authState.user.id);

    if (!error) {
      setAuthState(prev => ({
        ...prev,
        profile: { ...prev.profile!, credits: newBalance }
      }));
    }
  };

  return (
    <AuthContext.Provider value={{
      authState,
      signUp,
      signIn,
      signOut,
      updateProfile,
      updateCredits,
    }}>
      {children}
    </AuthContext.Provider>
  );
};