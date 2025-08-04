-- Update existing campaigns to have Germany as country_id (since user selected Germany)
UPDATE campaigns 
SET country_id = '5bd6559e-5f61-47ea-81de-5407d8f1a69a'  -- Germany
WHERE country_id IS NULL;

-- Create some test campaigns in pending_approval status for different countries
INSERT INTO campaigns (user_id, campaign_name, total_budget_credits, remaining_budget_credits, status, country_id) VALUES
('48819394-8243-4179-908e-9909184dc929', 'Test Campaign - Pending Approval', 100, 100, 'pending_approval', '5bd6559e-5f61-47ea-81de-5407d8f1a69a'),
('48819394-8243-4179-908e-9909184dc929', 'Another Test Campaign', 50, 50, 'pending_approval', '5bd6559e-5f61-47ea-81de-5407d8f1a69a');