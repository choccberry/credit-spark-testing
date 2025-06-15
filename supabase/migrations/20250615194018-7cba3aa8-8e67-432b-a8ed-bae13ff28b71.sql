
-- Add admin role for rollandmanilla@gmail.com
-- First, we need to find the user_id for this email from the profiles table
-- Then insert an admin role for that user

INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'rollandmanilla@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_roles.user_id = profiles.user_id 
  AND role = 'admin'
);
