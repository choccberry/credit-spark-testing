-- Insert sample ads for existing campaigns that don't have ads
INSERT INTO public.ads (campaign_id, ad_creative_path, target_url) 
SELECT 
    id, 
    'https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=600&h=400&fit=crop&crop=center',
    'https://example.com/product'
FROM public.campaigns 
WHERE status = 'active' 
AND id NOT IN (SELECT DISTINCT campaign_id FROM public.ads WHERE campaign_id IS NOT NULL);