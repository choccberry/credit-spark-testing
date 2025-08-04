-- Create some test campaigns with pending_approval status for the admin to review
INSERT INTO campaigns (user_id, campaign_name, total_budget_credits, remaining_budget_credits, status, country_id) VALUES
('48819394-8243-4179-908e-9909184dc929', 'Test Marketing Campaign', 200, 200, 'pending_approval', '0b426afc-6896-41b5-a579-f0e0927b173f'),
('48819394-8243-4179-908e-9909184dc929', 'Product Launch Campaign', 150, 150, 'pending_approval', '0b426afc-6896-41b5-a579-f0e0927b173f'),
('48819394-8243-4179-908e-9909184dc929', 'Summer Sale Campaign', 100, 100, 'pending_approval', '0b426afc-6896-41b5-a579-f0e0927b173f');