-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.can_view_ad(
  _user_id UUID,
  _ad_id UUID
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;

-- Fix search_path for campaign view function
CREATE OR REPLACE FUNCTION public.can_view_campaign_ad(
  _user_id UUID,
  _campaign_id UUID
) RETURNS BOOLEAN 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = ''
AS $$
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
$$;