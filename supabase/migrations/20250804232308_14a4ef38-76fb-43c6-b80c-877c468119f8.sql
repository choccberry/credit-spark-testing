-- Create ad_views table to track when users view specific ads
CREATE TABLE public.ad_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_id UUID NOT NULL,
  campaign_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  credits_earned INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ad_views ENABLE ROW LEVEL SECURITY;

-- Create policies for ad_views
CREATE POLICY "Users can view their own ad views" 
ON public.ad_views 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ad views" 
ON public.ad_views 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for performance on user_id and ad_id lookups
CREATE INDEX idx_ad_views_user_ad ON public.ad_views (user_id, ad_id);
CREATE INDEX idx_ad_views_user_campaign ON public.ad_views (user_id, campaign_id);
CREATE INDEX idx_ad_views_viewed_at ON public.ad_views (viewed_at);

-- Create function to check if user can view an ad (72-hour cooldown)
CREATE OR REPLACE FUNCTION public.can_view_ad(
  _user_id UUID,
  _ad_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has viewed this ad in the last 72 hours
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.ad_views 
    WHERE user_id = _user_id 
      AND ad_id = _ad_id 
      AND viewed_at > (now() - INTERVAL '72 hours')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user can view ads from a campaign (72-hour cooldown)
CREATE OR REPLACE FUNCTION public.can_view_campaign_ad(
  _user_id UUID,
  _campaign_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user has viewed any ad from this campaign in the last 72 hours
  RETURN NOT EXISTS (
    SELECT 1 
    FROM public.ad_views 
    WHERE user_id = _user_id 
      AND campaign_id = _campaign_id 
      AND viewed_at > (now() - INTERVAL '72 hours')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;