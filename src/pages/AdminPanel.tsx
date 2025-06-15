import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Check, X, Shield, Settings, BookOpen, Globe } from 'lucide-react';

interface Campaign {
  id: string;
  campaign_name: string;
  user_id: string;
  total_budget_credits: number;
  remaining_budget_credits: number;
  status: string;
  created_at: string;
}

interface Profile {
  id: string;
  user_id: string;
  username?: string;
  email?: string;
  credits: number;
}

const AdminPanel = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // For now, allow any authenticated user to access admin panel
  // In production, you'd check for admin role in the profile
  
  useEffect(() => {
    fetchCampaigns();
    fetchProfiles();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('status', 'pending_approval');

      if (error) {
        console.error('Error fetching campaigns:', error);
        return;
      }

      setCampaigns(data || []);
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

      // Remove from pending campaigns
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

      // Remove from campaigns
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

  const getCampaignOwner = (userId: string) => {
    return profiles.find(profile => profile.user_id === userId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading campaigns...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/admin/blog">
                <BookOpen className="h-4 w-4 mr-2" />
                Blog Management
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/pages">
                <Globe className="h-4 w-4 mr-2" />
                Page Management
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/adsense">
                <Settings className="h-4 w-4 mr-2" />
                AdSense Settings
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Admin Panel</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Campaign Approval</h2>
          <p className="text-muted-foreground">
            Review and approve pending ad campaigns.
          </p>
        </div>

        {campaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Check className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold mb-4">All Caught Up!</h3>
              <p className="text-muted-foreground">
                There are no campaigns pending approval at this time.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => {
              const owner = getCampaignOwner(campaign.user_id);
              return (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{campaign.campaign_name}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                          By {owner?.username} • Created on {new Date(campaign.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">
                        Pending Approval
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Budget</p>
                        <p className="text-lg font-semibold">{campaign.total_budget_credits} credits</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Estimated Views</p>
                        <p className="text-lg font-semibold">
                          {Math.floor(campaign.total_budget_credits / 5)} views
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Advertiser</p>
                        <p className="text-lg font-semibold">{owner?.username}</p>
                        <p className="text-sm text-muted-foreground">{owner?.email}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Ad Preview</p>
                      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-md">
                        <img 
                          src={`https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&crop=center`}
                          alt="Ad Preview"
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        onClick={() => handleApprove(campaign.id)}
                        className="flex-1"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        Approve Campaign
                      </Button>
                      <Button 
                        variant="destructive"
                        onClick={() => handleReject(campaign.id)}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Reject & Refund
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;