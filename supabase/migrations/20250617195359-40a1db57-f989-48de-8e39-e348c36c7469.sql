
-- Create countries table to manage supported countries
CREATE TABLE public.countries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE, -- ISO country code like 'US', 'CA', 'UK'
  currency text NOT NULL DEFAULT 'USD',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add country_id to profiles table
ALTER TABLE public.profiles 
ADD COLUMN country_id uuid REFERENCES public.countries(id);

-- Add country_id to campaigns table  
ALTER TABLE public.campaigns 
ADD COLUMN country_id uuid REFERENCES public.countries(id);

-- Update RLS policies for campaigns to include country isolation
DROP POLICY IF EXISTS "Users can view their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can create their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can update their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Users can delete their own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can view all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can update all campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Admins can delete all campaigns" ON public.campaigns;

-- New RLS policies that respect country boundaries
CREATE POLICY "Users can view campaigns in their country" 
  ON public.campaigns 
  FOR SELECT 
  USING (
    country_id IN (
      SELECT country_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND (
      user_id = auth.uid() 
      OR EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

CREATE POLICY "Users can create campaigns in their country" 
  ON public.campaigns 
  FOR INSERT 
  WITH CHECK (
    country_id IN (
      SELECT country_id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND user_id = auth.uid()
  );

CREATE POLICY "Users can update their own campaigns in their country" 
  ON public.campaigns 
  FOR UPDATE 
  USING (
    user_id = auth.uid() 
    AND country_id IN (
      SELECT country_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own campaigns in their country" 
  ON public.campaigns 
  FOR DELETE 
  USING (
    user_id = auth.uid() 
    AND country_id IN (
      SELECT country_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage campaigns in their country" 
  ON public.campaigns 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
    AND country_id IN (
      SELECT country_id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Insert some initial countries
INSERT INTO public.countries (name, code, currency) VALUES
  ('United States', 'US', 'USD'),
  ('Canada', 'CA', 'CAD'),
  ('United Kingdom', 'UK', 'GBP'),
  ('Australia', 'AU', 'AUD'),
  ('Germany', 'DE', 'EUR'),
  ('France', 'FR', 'EUR'),
  ('Japan', 'JP', 'JPY'),
  ('Brazil', 'BR', 'BRL');

-- Enable RLS on countries table
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read countries (for country selection)
CREATE POLICY "Anyone can view active countries" 
  ON public.countries 
  FOR SELECT 
  USING (is_active = true);

-- Only admins can manage countries
CREATE POLICY "Admins can manage countries" 
  ON public.countries 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
