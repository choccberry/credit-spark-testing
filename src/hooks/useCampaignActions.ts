
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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

interface CampaignWithAd extends Campaign {
  ads?: Ad[];
}

export const useCampaignActions = (
  campaigns: CampaignWithAd[],
  setCampaigns: React.Dispatch<React.SetStateAction<CampaignWithAd[]>>
) => {
  const { toast } = useToast();

  const handleApprove = async (campaignId: string) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (error) {
        console.error('Error approving campaign:', error);
        toast({
          title: 'Error',
          description: 'Failed to approve campaign.',
          variant: 'destructive',
        });
        return;
      }

      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      
      toast({
        title: 'Campaign approved',
        description: 'The campaign has been approved and is now active.',
      });
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve campaign.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (campaignId: string) => {
    try {
      const campaign = campaigns.find(c => c.id === campaignId);
      if (!campaign) return;

      // Get current user credits and refund
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('credits')
        .eq('user_id', campaign.user_id)
        .single();

      if (!profileError && profileData) {
        const { error: creditError } = await supabase
          .from('profiles')
          .update({ 
            credits: profileData.credits + campaign.total_budget_credits
          })
          .eq('user_id', campaign.user_id);

        if (creditError) {
          console.error('Error refunding credits:', creditError);
        }
      }

      // Delete the campaign
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (deleteError) {
        console.error('Error deleting campaign:', deleteError);
        toast({
          title: 'Error',
          description: 'Failed to reject campaign.',
          variant: 'destructive',
        });
        return;
      }

      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      
      toast({
        title: 'Campaign rejected',
        description: 'The campaign has been rejected and credits have been refunded.',
      });
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject campaign.',
        variant: 'destructive',
      });
    }
  };

  return { handleApprove, handleReject };
};
