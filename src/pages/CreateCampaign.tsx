
import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { mockCampaigns, mockAds } from '@/data/mockData';
import { ArrowLeft, Upload, Coins } from 'lucide-react';

const CreateCampaign = () => {
  const { authState, updateCredits } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [campaignName, setCampaignName] = useState('');
  const [budget, setBudget] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!authState.user) return;

    const budgetAmount = parseInt(budget);
    
    if (budgetAmount <= 0) {
      toast({
        title: 'Invalid budget',
        description: 'Budget must be greater than 0.',
        variant: 'destructive',
      });
      return;
    }

    if (budgetAmount > authState.user.creditBalance) {
      toast({
        title: 'Insufficient credits',
        description: 'You do not have enough credits for this budget.',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedImage) {
      toast({
        title: 'Missing image',
        description: 'Please select an ad image.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create new campaign
      const newCampaign = {
        id: mockCampaigns.length + 1,
        userId: authState.user.id,
        campaignName,
        totalBudgetCredits: budgetAmount,
        remainingBudgetCredits: budgetAmount,
        status: 'pending_approval' as const,
        createdAt: new Date().toISOString(),
      };

      mockCampaigns.push(newCampaign);

      // Create ad
      const newAd = {
        id: mockAds.length + 1,
        campaignId: newCampaign.id,
        adCreativePath: `/uploads/${selectedImage.name}`,
        targetUrl,
      };

      mockAds.push(newAd);

      // Deduct credits from user
      updateCredits(authState.user.creditBalance - budgetAmount);

      toast({
        title: 'Campaign created!',
        description: 'Your campaign has been created and is pending approval.',
      });

      navigate('/my-campaigns');

    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
              <Link to="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold">Create Campaign</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{authState.user?.creditBalance} Credits</span>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Create New Ad Campaign</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaignName">Campaign Name</Label>
                <Input
                  id="campaignName"
                  type="text"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  placeholder="Enter campaign name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Campaign Budget (Credits)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="Enter budget amount"
                  min="1"
                  max={authState.user?.creditBalance}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Each ad view costs 5 credits. Available: {authState.user?.creditBalance} credits
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetUrl">Target URL</Label>
                <Input
                  id="targetUrl"
                  type="url"
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://example.com"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Where users will be directed when they click your ad
                </p>
              </div>


              <div className="space-y-2">
                <Label htmlFor="adImage">Ad Image</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                  <input
                    id="adImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                    required
                  />
                  <label htmlFor="adImage" className="cursor-pointer">
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    {selectedImage ? (
                      <div>
                        <p className="font-medium">{selectedImage.name}</p>
                        <p className="text-sm text-muted-foreground">Click to change</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">Upload Ad Image</p>
                        <p className="text-sm text-muted-foreground">Click to select an image file</p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Campaign Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Budget:</span>
                    <span>{budget || 0} credits</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated views:</span>
                    <span>{budget ? Math.floor(parseInt(budget) / 5) : 0} views</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cost per view:</span>
                    <span>5 credits</span>
                  </div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Creating Campaign...' : 'Create Campaign'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreateCampaign;
