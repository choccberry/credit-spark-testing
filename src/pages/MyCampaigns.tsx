import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { mockCampaigns, mockUsers } from '@/data/mockData';
import { ArrowLeft, Plus, Coins, Trash2 } from 'lucide-react';

const MyCampaigns = () => {
  const { authState, updateCredits } = useAuth();
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState(mockCampaigns);

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  useEffect(() => {
    setCampaigns([...mockCampaigns]);
  }, []);

  const userCampaigns = campaigns.filter(campaign => campaign.userId === authState.user?.id);

  const handleDeleteCampaign = (campaignId: number) => {
    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex !== -1) {
      const campaign = mockCampaigns[campaignIndex];
      
      // Refund remaining credits if campaign is pending or has remaining budget
      if (campaign.status === 'pending_approval' || campaign.remainingBudgetCredits > 0) {
        const refundAmount = campaign.status === 'pending_approval' 
          ? campaign.totalBudgetCredits 
          : campaign.remainingBudgetCredits;
        
        updateCredits((authState.user?.creditBalance || 0) + refundAmount);
        
        // Update user's balance in mock data too
        const userIndex = mockUsers.findIndex(u => u.id === authState.user?.id);
        if (userIndex !== -1) {
          mockUsers[userIndex].creditBalance += refundAmount;
        }
      }

      // Remove campaign
      mockCampaigns.splice(campaignIndex, 1);
      setCampaigns([...mockCampaigns]);
      
      toast({
        title: 'Campaign deleted',
        description: campaign.status === 'pending_approval' 
          ? 'Campaign deleted and credits refunded.'
          : campaign.remainingBudgetCredits > 0 
          ? 'Campaign deleted and remaining credits refunded.'
          : 'Campaign deleted successfully.',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'paused':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100';
    }
  };

  const formatStatus = (status: string) => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

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
            <div className="flex items-center gap-2 text-sm">
              <Coins className="h-4 w-4 text-yellow-500" />
              <span className="font-medium">{authState.user?.creditBalance} Credits</span>
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
        {userCampaigns.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-4">No Campaigns Yet</h3>
              <p className="text-muted-foreground mb-6">
                You haven't created any campaigns yet. Start promoting your products or services!
              </p>
              <Button asChild>
                <Link to="/create-campaign">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Campaign
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-6">
              {userCampaigns.map((campaign) => (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{campaign.campaignName}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                          Created on {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {formatStatus(campaign.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Total Budget</p>
                        <p className="text-lg font-semibold">{campaign.totalBudgetCredits} credits</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Remaining Budget</p>
                        <p className="text-lg font-semibold">{campaign.remainingBudgetCredits} credits</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Views Completed</p>
                        <p className="text-lg font-semibold">
                          {Math.floor((campaign.totalBudgetCredits - campaign.remainingBudgetCredits) / 5)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Progress</p>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ 
                              width: `${((campaign.totalBudgetCredits - campaign.remainingBudgetCredits) / campaign.totalBudgetCredits) * 100}%` 
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {Math.round(((campaign.totalBudgetCredits - campaign.remainingBudgetCredits) / campaign.totalBudgetCredits) * 100)}% complete
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDeleteCampaign(campaign.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Campaign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MyCampaigns;