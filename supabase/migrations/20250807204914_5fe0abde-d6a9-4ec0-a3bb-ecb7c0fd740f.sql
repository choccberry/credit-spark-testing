-- Create vendor categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Categories are viewable by everyone
CREATE POLICY "Categories are viewable by everyone" 
ON public.categories 
FOR SELECT 
USING (is_active = true);

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" 
ON public.categories 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Insert popular vendor categories
INSERT INTO public.categories (name, slug, description, icon) VALUES
('Electronics & Gadgets', 'electronics-gadgets', 'Smartphones, laptops, gaming, smart home devices', 'smartphone'),
('Fashion & Clothing', 'fashion-clothing', 'Clothing, shoes, accessories, jewelry', 'shirt'),
('Food & Restaurants', 'food-restaurants', 'Restaurants, food delivery, catering services', 'utensils'),
('Real Estate & Property', 'real-estate-property', 'Property listings, rentals, real estate services', 'home'),
('Automotive', 'automotive', 'Cars, motorcycles, auto parts, services', 'car'),
('Health & Beauty', 'health-beauty', 'Cosmetics, skincare, wellness, fitness', 'heart'),
('Home & Garden', 'home-garden', 'Furniture, home decor, gardening, appliances', 'home'),
('Sports & Recreation', 'sports-recreation', 'Sports equipment, outdoor gear, fitness', 'activity'),
('Education & Training', 'education-training', 'Courses, tutoring, educational services', 'book-open'),
('Business Services', 'business-services', 'Professional services, consulting, marketing', 'briefcase'),
('Travel & Tourism', 'travel-tourism', 'Hotels, tours, travel agencies, experiences', 'plane'),
('Entertainment', 'entertainment', 'Events, shows, gaming, media', 'play-circle');

-- Create states/provinces table
CREATE TABLE public.states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(country_id, code)
);

-- Enable RLS on states
ALTER TABLE public.states ENABLE ROW LEVEL SECURITY;

-- States are viewable by everyone
CREATE POLICY "States are viewable by everyone" 
ON public.states 
FOR SELECT 
USING (is_active = true);

-- Admins can manage states
CREATE POLICY "Admins can manage states" 
ON public.states 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Create cities table
CREATE TABLE public.cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  state_id UUID NOT NULL REFERENCES public.states(id) ON DELETE CASCADE,
  country_id UUID NOT NULL REFERENCES public.countries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on cities
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- Cities are viewable by everyone
CREATE POLICY "Cities are viewable by everyone" 
ON public.cities 
FOR SELECT 
USING (is_active = true);

-- Admins can manage cities
CREATE POLICY "Admins can manage cities" 
ON public.cities 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'::app_role
));

-- Add category and location fields to campaigns table
ALTER TABLE public.campaigns 
ADD COLUMN category_id UUID REFERENCES public.categories(id),
ADD COLUMN state_id UUID REFERENCES public.states(id),
ADD COLUMN city_id UUID REFERENCES public.cities(id);

-- Add trigger for updating timestamps
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_states_updated_at
  BEFORE UPDATE ON public.states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cities_updated_at
  BEFORE UPDATE ON public.cities
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();