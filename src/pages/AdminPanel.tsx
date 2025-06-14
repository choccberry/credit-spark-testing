import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { mockCampaigns, mockUsers } from '@/data/mockData';
import { ArrowLeft, Check, X, Shield, Settings, BookOpen, Globe } from 'lucide-react';

const AdminPanel = () => {
  const { authState } = useAuth();
  const { toast } = useToast();

  if (!authState.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Simple admin check - in real app this would be more sophisticated
  if (authState.user?.id !== 1) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="text-center py-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground mb-6">
              You don't have permission to access the admin panel.
            </p>
            <Button asChild>
              <Link to="/dashboard">Return to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const [campaigns, setCampaigns] = useState(mockCampaigns);
  const [, forceUpdate] = useState(0);
  
  useEffect(() => {
    // Update campaigns state when mockCampaigns changes
    setCampaigns([...mockCampaigns]);
    
    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      setCampaigns([...mockCampaigns]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const pendingCampaigns = campaigns.filter(campaign => campaign.status === 'pending_approval');

  const handleApprove = (campaignId: number) => {
    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex !== -1) {
      mockCampaigns[campaignIndex].status = 'active';
      setCampaigns([...mockCampaigns]);
      toast({
        title: 'Campaign approved',
        description: 'The campaign has been approved and is now active.',
      });
    }
  };

  const handleReject = (campaignId: number) => {
    const campaignIndex = mockCampaigns.findIndex(c => c.id === campaignId);
    if (campaignIndex !== -1) {
      const campaign = mockCampaigns[campaignIndex];
      
      // Refund credits to the advertiser
      const userIndex = mockUsers.findIndex(u => u.id === campaign.userId);
      if (userIndex !== -1) {
        mockUsers[userIndex].creditBalance += campaign.totalBudgetCredits;
      }

      // Remove the campaign
      mockCampaigns.splice(campaignIndex, 1);
      setCampaigns([...mockCampaigns]);
      
      toast({
        title: 'Campaign rejected',
        description: 'The campaign has been rejected and credits have been refunded.',
      });
    }
  };

  const getCampaignOwner = (userId: number) => {
    return mockUsers.find(user => user.id === userId);
  };

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

        {pendingCampaigns.length === 0 ? (
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
            {pendingCampaigns.map((campaign) => {
              const owner = getCampaignOwner(campaign.userId);
              return (
                <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl">{campaign.campaignName}</CardTitle>
                        <p className="text-muted-foreground text-sm mt-1">
                          By {owner?.username} • Created on {new Date(campaign.createdAt).toLocaleDateString()}
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
                        <p className="text-lg font-semibold">{campaign.totalBudgetCredits} credits</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">Estimated Views</p>
                        <p className="text-lg font-semibold">
                          {Math.floor(campaign.totalBudgetCredits / 5)} views
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