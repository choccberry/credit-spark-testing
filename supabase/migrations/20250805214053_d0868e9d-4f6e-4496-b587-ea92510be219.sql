-- Create function to handle complete user account deletion
-- This function deletes the user from auth.users which will cascade to profiles
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Delete the user from auth.users (this will cascade to profiles via foreign key)
  DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;