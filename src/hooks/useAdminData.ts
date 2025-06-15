
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [campaigns, setCampaigns] = useState<CampaignWithAd[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      fetchCampaigns();
      fetchProfiles();
    }
  }, [isAdmin]);

  const fetchCampaigns = async () => {
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
        .eq('status', 'pending_approval');

      if (campaignsError) {
        console.error('Error fetching campaigns:', campaignsError);
        return;
      }

      console.log('Fetched campaigns with ads:', campaignsData);
      setCampaigns(campaignsData || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

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
