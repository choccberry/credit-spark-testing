-- Create a sample non-admin user ID for demo purposes
-- Insert campaigns with different user ownership to allow regular users to view ads

INSERT INTO public.campaigns (
    campaign_name, 
    user_id, 
    total_budget_credits, 
    remaining_budget_credits, 
    status, 
    country_id
) VALUES 
    ('Fashion Store Promotion', '00000000-0000-0000-0000-000000000001', 100, 100, 'active', '0b426afc-6896-41b5-a579-f0e0927b173f'),
    ('Tech Gadgets Sale', '00000000-0000-0000-0000-000000000002', 75, 75, 'active', '0b426afc-6896-41b5-a579-f0e0927b173f'),
    ('Food Delivery Service', '00000000-0000-0000-0000-000000000003', 50, 50, 'active', '0b426afc-6896-41b5-a579-f0e0927b173f');

-- Insert corresponding ads for these campaigns
INSERT INTO public.ads (campaign_id, ad_creative_path, target_url)
SELECT 
    c.id,
    CASE 
        WHEN c.campaign_name = 'Fashion Store Promotion' THEN 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop&crop=center'
        WHEN c.campaign_name = 'Tech Gadgets Sale' THEN 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=600&h=400&fit=crop&crop=center'
        ELSE 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop&crop=center'
    END,
    CASE 
        WHEN c.campaign_name = 'Fashion Store Promotion' THEN 'https://example.com/fashion'
        WHEN c.campaign_name = 'Tech Gadgets Sale' THEN 'https://example.com/tech'
        ELSE 'https://example.com/food'
    END
FROM public.campaigns c
WHERE c.user_id IN ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003');