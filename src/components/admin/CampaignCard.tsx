
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';

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

interface CampaignCardProps {
  campaign: CampaignWithAd;
  owner: Profile | undefined;
  onApprove: (campaignId: string) => void;
  onReject: (campaignId: string) => void;
}

const CampaignCard = ({ campaign, owner, onApprove, onReject }: CampaignCardProps) => {
  const campaignAd = campaign.ads && campaign.ads.length > 0 ? campaign.ads[0] : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{campaign.campaign_name}</CardTitle>
            <p className="text-muted-foreground text-sm mt-1">
              By {owner?.username || owner?.email} • Created on {new Date(campaign.created_at).toLocaleDateString()}
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
            <p className="text-lg font-semibold">{owner?.username || 'Unknown User'}</p>
            <p className="text-sm text-muted-foreground">{owner?.email}</p>
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Ad Preview</p>
          {campaignAd && campaignAd.ad_creative_path ? (
            <div className="space-y-2">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-md overflow-hidden">
                <img 
                  src={campaignAd.ad_creative_path}
                  alt="Ad Creative"
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    console.error('Error loading ad image:', campaignAd.ad_creative_path);
                    e.currentTarget.src = `https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=400&h=300&fit=crop&crop=center`;
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Target URL: <a href={campaignAd.target_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{campaignAd.target_url}</a>
              </p>
            </div>
          ) : (
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center max-w-md">
              <p className="text-muted-foreground">No ad creative uploaded</p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={() => onApprove(campaign.id)}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-2" />
            Approve Campaign
          </Button>
          <Button 
            variant="destructive"
            onClick={() => onReject(campaign.id)}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Reject & Refund
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CampaignCard;
