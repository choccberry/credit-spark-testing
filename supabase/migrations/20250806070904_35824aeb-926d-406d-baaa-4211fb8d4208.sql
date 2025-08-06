-- Create storage buckets for website icons and profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES 
  ('website-icons', 'website-icons', true, 5242880, '{"image/png","image/jpeg","image/jpg","image/webp","image/svg+xml"}'),
  ('profile-pictures', 'profile-pictures', true, 2097152, '{"image/png","image/jpeg","image/jpg","image/webp"}');

-- Create policies for website icons (admin only)
CREATE POLICY "Admins can upload website icons" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'website-icons' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Website icons are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'website-icons');

CREATE POLICY "Admins can update website icons" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'website-icons' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Admins can delete website icons" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'website-icons' AND 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

-- Create policies for profile pictures
CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Profile pictures are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own profile pictures" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'profile-pictures' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create admin_settings table for storing admin configurations
CREATE TABLE public.admin_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb,
  country_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for admin_settings
CREATE POLICY "Admins can manage settings in their country" 
ON public.admin_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN profiles p ON p.user_id = ur.user_id
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
    AND (admin_settings.country_id IS NULL OR p.country_id = admin_settings.country_id)
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();