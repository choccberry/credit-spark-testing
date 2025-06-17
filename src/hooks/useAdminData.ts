import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SupabaseAuthProvider';

interface Campaign {
  id: string;
  campaign_name: string;
  user_id: string;
  total_budget_credits: number;
  remaining_budget_credits: number;
  status: string;
  created_at: string;
}

interface Ad {
  id: string;
  campaign_id: string;
  ad_creative_path: string;
  target_url: string;
}

interface Profile {
  id: string;
  user_id: string;
  username?: string;
  email?: string;
  credits: number;
}

interface CampaignWithAd extends Campaign {
  ads?: Ad[];
}

export const useAdminData = (isAdmin: boolean) => {
  const { authState } = useAuth();
  const [campaigns, setCampaigns] = useState<CampaignWithAd[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin && authState.profile?.country_id) {
      fetchCampaigns();
      fetchProfiles();
    }
  }, [isAdmin, authState.profile?.country_id]);

  const fetchCampaigns = async () => {
    if (!authState.profile?.country_id) return;

    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('campaigns')
        .select(`
          *,
          ads (
            id,
            campaign_id,
            ad_creative_path,
            target_url
          )
        `)
        .eq('status', 'pending_approval')
        .eq('country_id', authState.profile.country_id);

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        return;
      }

      console.log('Fetched campaigns with ads for country:', campaignsData);
      setCampaigns(campaignsData || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    if (!authState.profile?.country_id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('country_id', authState.profile.country_id);

      if (error) {
        console.error('Error fetching profiles:', error);
        return;
      }

      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const getCampaignOwner = (userId: string) => {
    return profiles.find(profile => profile.user_id === userId);
  };

  return { campaigns, setCampaigns, profiles, loading, getCampaignOwner };
};
