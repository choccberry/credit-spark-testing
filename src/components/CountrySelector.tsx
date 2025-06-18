import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { Country } from '@/types/profile';

interface CountrySelectorProps {
  onCountryChange?: (country: Country | null) => void;
  showLabel?: boolean;
  className?: string;
}

const CountrySelector = ({ onCountryChange, showLabel = true, className }: CountrySelectorProps) => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const { authState, updateProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    if (authState.profile?.country_id) {
      setSelectedCountry(authState.profile.country_id);
    }
  }, [authState.profile]);

  const fetchCountries = async () => {
    try {
      const { data, error } = await supabase
        .from('countries')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('Error fetching countries:', error);
        return;
      }

      setCountries(data || []);
    } catch (error) {
      console.error('Error fetching countries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountryChange = async (countryId: string) => {
    if (!authState.user) return;

    setSelectedCountry(countryId);
    const country = countries.find(c => c.id === countryId);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ country_id: countryId })
        .eq('user_id', authState.user.id);

      if (error) {
        console.error('Error updating country:', error);
        toast({
          title: 'Error',
          description: 'Failed to update country selection.',
          variant: 'destructive',
        });
        return;
      }

      // Update local profile
      if (authState.profile) {
        updateProfile({ ...authState.profile, country_id: countryId });
      }

      if (onCountryChange) {
        onCountryChange(country || null);
      }

      toast({
        title: 'Country updated',
        description: `You've selected ${country?.name} as your country.`,
      });
    } catch (error) {
      console.error('Error updating country:', error);
      toast({
        title: 'Error',
        description: 'Failed to update country selection.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className={className}>
        {showLabel && <label className="text-sm font-medium">Country</label>}
        <div className="h-10 bg-muted animate-pulse rounded-md"></div>
      </div>
    );
  }

  return (
    <div className={className}>
      {showLabel && <label className="text-sm font-medium mb-2 block">Country</label>}
      <Select value={selectedCountry} onValueChange={handleCountryChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select your country..." />
        </SelectTrigger>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.id} value={country.id}>
              {country.name} ({country.code})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CountrySelector;
