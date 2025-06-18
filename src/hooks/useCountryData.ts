
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { Country } from '@/types/profile';

export const useCountryData = () => {
  const { authState } = useAuth();
  const [userCountry, setUserCountry] = useState<Country | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authState.profile?.country_id) {
      fetchUserCountry();
    } else {
      setLoading(false);
    }
  }, [authState.profile?.country_id]);

  const fetchUserCountry = async () => {
    if (!authState.profile?.country_id) return;

    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('id', authState.profile.country_id)
        .single();

      if (error) {
        console.error('Error fetching user country:', error);
        return;
      }

      setUserCountry(data);
    } catch (error) {
      console.error('Error fetching user country:', error);
    } finally {
      setLoading(false);
    }
  };

  return { userCountry, loading };
};
