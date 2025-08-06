import React, { useState, useEffect } from 'react';
import AdSenseAd from '@/components/AdSenseAd';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/contexts/SupabaseAuthProvider';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ExternalLink, Coins, Clock } from 'lucide-react';

interface Ad {
  id: string;
  campaign_id: string;
  ad_creative_path: string;
  target_url: string;
}

interface Campaign {
  id: string;
  campaign_name: string;
  user_id: string;
  total_budget_credits: number;
  remaining_budget_credits: number;
  status: string;
}

interface AdWithCampaign extends Ad {
  campaign?: Campaign;
}

const ViewAds = () => {
  const { authState, updateCredits } = useAuth();
  const { toast } = useToast();
  const [currentAd, setCurrentAd] = useState<AdWithCampaign | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [adsViewed, setAdsViewed] = useState(() => {
    const saved = localStorage.getItem('adsViewed');
    return saved ? parseInt(saved) : 0;
  });
  const [showAdSense, setShowAdSense] = useState(false);
  const [cooldownEnd, setCooldownEnd] = useState<Date | null>(null);

  if (!authState.isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  const loadRandomAd = async () => {
    if (!authState.user) return;

    try {
      // Get user's country ID
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('country_id')
        .eq('user_id', authState.user.id)
        .single();

      if (!userProfile?.country_id) {
        console.log('User has no country selected');
        setCurrentAd(null);
        return;
      }

      // Get active campaigns with ads that user hasn't viewed in last 72 hours
      const { data: adsWithCampaigns, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          campaign_name,
          user_id,
          total_budget_credits,
          remaining_budget_credits,
          status,
          ads (
            id,
            campaign_id,
            ad_creative_path,
            target_url
          )
        `)
        .eq('status', 'active')
        .eq('country_id', userProfile.country_id)
        .gt('remaining_budget_credits', 0)
        .neq('user_id', authState.user.id);

      if (error) {
        console.error('Error fetching ads:', error);
        setCurrentAd(null);
        return;
      }

      if (!adsWithCampaigns || adsWithCampaigns.length === 0) {
        console.log('No active campaigns found');
        setCurrentAd(null);
        return;
      }

      // Flatten campaigns to ads and filter out campaigns user viewed recently
      const availableAds: AdWithCampaign[] = [];
      
      for (const campaign of adsWithCampaigns) {
        if (campaign.ads && campaign.ads.length > 0) {
          // Check if user can view ads from this campaign (72-hour cooldown)
          const { data: canView } = await supabase.rpc('can_view_campaign_ad', {
            _user_id: authState.user.id,
            _campaign_id: campaign.id
          });

          if (canView) {
            campaign.ads.forEach(ad => {
              availableAds.push({
                ...ad,
                campaign: campaign
              });
            });
          }
        }
      }

      if (availableAds.length === 0) {
        console.log('No available ads after cooldown check');
        // Check when user can view ads again
        const { data: recentViews } = await supabase
          .from('ad_views')
          .select('viewed_at')
          .eq('user_id', authState.user.id)
          .order('viewed_at', { ascending: false })
          .limit(1);

        if (recentViews && recentViews.length > 0) {
          const lastView = new Date(recentViews[0].viewed_at);
          const cooldownEnd = new Date(lastView.getTime() + (72 * 60 * 60 * 1000)); // 72 hours
          setCooldownEnd(cooldownEnd);
        }

        setCurrentAd(null);
        return;
      }

      console.log(`Found ${availableAds.length} available ads`);
      const randomIndex = Math.floor(Math.random() * availableAds.length);
      setCurrentAd(availableAds[randomIndex]);
      setTimeRemaining(30);
      setCanClaim(false);
      setCooldownEnd(null);
    } catch (error) {
      console.error('Error loading ads:', error);
      setCurrentAd(null);
    }
  };

  useEffect(() => {
    loadRandomAd();
  }, [authState.user]);

  useEffect(() => {
    if (timeRemaining > 0 && currentAd) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0) {
      setCanClaim(true);
    }
  }, [timeRemaining, currentAd]);

  const handleClaimCredits = async () => {
    if (!currentAd || !authState.user) return;

    setIsLoading(true);
    
    try {
      // Record the ad view in database
      const { error: viewError } = await supabase
        .from('ad_views')
        .insert({
          user_id: authState.user.id,
          ad_id: currentAd.id,
          campaign_id: currentAd.campaign_id,
          credits_earned: 5
        });

      if (viewError) {
        console.error('Error recording ad view:', viewError);
        toast({
          title: 'Error',
          description: 'Failed to record ad view. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      // Update user credits in database
      const newBalance = (authState.profile?.credits || 0) + 5;
      const { error: creditsError } = await supabase
        .from('profiles')
        .update({ credits: newBalance })
        .eq('user_id', authState.user.id);

      if (creditsError) {
        console.error('Error updating credits:', creditsError);
        toast({
          title: 'Error',
          description: 'Failed to update credits. Please try again.',
          variant: 'destructive'
        });
        return;
      }

      // Update campaign budget
      const newBudget = (currentAd.campaign?.remaining_budget_credits || 0) - 5;
      const newStatus = newBudget <= 0 ? 'completed' : 'active';
      
      const { error: campaignError } = await supabase
        .from('campaigns')
        .update({ 
          remaining_budget_credits: newBudget,
          status: newStatus
        })
        .eq('id', currentAd.campaign_id);

      if (campaignError) {
        console.error('Error updating campaign:', campaignError);
      }

      // Update local state
      updateCredits(newBalance);

      // Increment ads viewed counter
      const newAdsViewed = adsViewed + 1;
      setAdsViewed(newAdsViewed);
      localStorage.setItem('adsViewed', newAdsViewed.toString());

      // Show AdSense ad every 30 views
      if (newAdsViewed % 30 === 0) {
        setShowAdSense(true);
        toast({
          title: 'Credits earned!',
          description: 'You have successfully earned 5 credits. Watch our sponsor message!',
        });
      } else {
        toast({
          title: 'Credits earned!',
          description: 'You have successfully earned 5 credits.',
        });
      }

      // Load next available ad after a short delay
      setTimeout(() => {
        if (newAdsViewed % 30 !== 0) {
          loadRandomAd();
        }
      }, 1000);

    } catch (error) {
      console.error('Error claiming credits:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseAdSense = () => {
    setShowAdSense(false);
    loadRandomAd();
  };

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Available now';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
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
            <h1 className="text-2xl font-bold">View Ads</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Coins className="h-4 w-4 text-yellow-500" />
            <span className="font-medium">{authState.profile?.credits || 0} Credits</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Platform AdSense Ad */}
        <AdSenseAd adType="viewAds" className="mb-8" />
        
        {currentAd ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">
                {currentAd.campaign?.campaign_name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative">
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
                  <img 
                    src={currentAd.ad_creative_path.startsWith('http') 
                      ? currentAd.ad_creative_path 
                      : `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop&crop=center`
                    }
                    alt="Advertisement"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => window.open(currentAd.target_url, '_blank')}
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-all cursor-pointer flex items-center justify-center">
                    <ExternalLink className="text-white opacity-0 hover:opacity-100 transition-opacity h-8 w-8" />
                  </div>
                </div>
                {!canClaim && (
                  <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg">
                    <div className="text-sm font-medium">Watch Time</div>
                    <div className="text-xl font-bold">{timeRemaining}s</div>
                  </div>
                )}
              </div>

              <div className="text-center space-y-4">
                <p className="text-muted-foreground">
                  Watch this ad for 30 seconds to earn 5 credits
                </p>

                <Button 
                  onClick={handleClaimCredits}
                  disabled={!canClaim || isLoading}
                  size="lg"
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : canClaim ? 'Claim 5 Credits' : `Wait ${timeRemaining}s`}
                </Button>

                {canClaim && (
                  <p className="text-sm text-green-600 font-medium">
                    Ad viewing complete! You can now claim your credits.
                  </p>
                )}
              </div>

              <div className="text-center">
                <Button 
                  variant="outline" 
                  onClick={loadRandomAd}
                  disabled={timeRemaining > 0 && timeRemaining < 30}
                >
                  Load Different Ad
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="text-center py-12">
              {cooldownEnd ? (
                <>
                  <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-xl font-semibold mb-4">Cooldown Period</h3>
                  <p className="text-muted-foreground mb-6">
                    You need to wait 72 hours between viewing ads from the same campaigns. 
                    You can view new ads again in: <strong>{formatTimeRemaining(cooldownEnd)}</strong>
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-4">No Ads Available</h3>
                  <p className="text-muted-foreground mb-6">
                    There are currently no active ads available for viewing. Check back later!
                  </p>
                </>
              )}
              <Button asChild>
                <Link to="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* AdSense Modal - Shows every 30 ads */}
        {showAdSense && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="max-w-lg mx-4">
              <CardHeader>
                <CardTitle className="text-center">Sponsor Message</CardTitle>
                <p className="text-center text-muted-foreground">
                  Thank you for using our platform! Here's a message from our sponsor.
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted rounded-lg p-4 min-h-[200px] flex items-center justify-center">
                  <AdSenseAd adType="viewAds" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    You've viewed {adsViewed} ads so far. Keep watching to earn more credits!
                  </p>
                  <Button onClick={handleCloseAdSense} className="w-full">
                    Continue Watching Ads
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default ViewAds;