
import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Plus, Coins, Trash2 } from 'lucide-react';

interface Campaign {
  id: string;
  campaign_name: string;
  total_budget_credits: number;
  remaining_budget_credits: number;
  status: string;
  created_at: string;
}

const MyCampaigns = () => {
  const { authState } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    if (authState.user) {
      fetchCampaigns();
    }
  }, [authState.user]);

  const fetchCampaigns = async () => {
    if (!authState.user) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

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

  const userCredits = authState.profile?.credits || 0;

  const handleDeleteCampaign = async (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign || !authState.user) return;

    try {
      // Only allow deletion if pending approval
      if (campaign.status !== 'pending_approval') {
        toast({
          title: 'Cannot delete',
          description: 'Only pending campaigns can be deleted.',
          variant: 'destructive',
        });
        return;
      }

      // Delete campaign
      const { error: deleteError } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (deleteError) {
        console.error('Error deleting campaign:', deleteError);
        toast({
          title: 'Error',
          description: 'Failed to delete campaign.',
          variant: 'destructive',
        });
        return;
      }

      // Refund credits
      const { error: creditError } = await supabase
        .from('profiles')
        .update({ 
          credits: userCredits + campaign.total_budget_credits
        })
        .eq('user_id', authState.user.id);

      if (creditError) {
        console.error('Error refunding credits:', creditError);
      }

      // Update local state
      setCampaigns(campaigns.filter(c => c.id !== campaignId));
      
      toast({
        title: 'Campaign deleted',
        description: `Campaign deleted and ${campaign.total_budget_credits} credits refunded.`,
      });
    } catch (error) {
      console.error('Error deleting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete campaign.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100">Pending Approval</Badge>;
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">Active</Badge>;
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
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
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">My Campaigns</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm bg-primary/10 px-3 py-2 rounded-lg">
              <Coins className="h-4 w-4 text-primary" />
              <span className="font-medium">{userCredits} credits</span>
            </div>
            <Button asChild>
              <Link to="/create-campaign">
                <Plus className="h-4 w-4 mr-2" />
                New Campaign
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {campaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">No Campaigns Yet</h3>
              <p className="text-muted-foreground mb-6">
                Create your first advertising campaign to start promoting your business.
              </p>
              <Button asChild>
                <Link to="/create-campaign">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Campaign
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{campaign.campaign_name}</CardTitle>
                      <p className="text-muted-foreground text-sm mt-1">
                        Created on {new Date(campaign.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {getStatusBadge(campaign.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                      <p className="text-lg font-semibold">{campaign.total_budget_credits} credits</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Remaining Budget</p>
                      <p className="text-lg font-semibold">{campaign.remaining_budget_credits} credits</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Estimated Views</p>
                      <p className="text-lg font-semibold">
                        {Math.floor(campaign.total_budget_credits / 5)} total
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {campaign.status === 'pending_approval' && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Cancel & Refund
                      </Button>
                    )}
                    {campaign.status === 'active' && (
                      <Button variant="outline" size="sm">
                        View Stats
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCampaigns;
