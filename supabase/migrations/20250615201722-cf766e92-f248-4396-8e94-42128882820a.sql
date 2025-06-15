
-- Enable RLS on campaigns table (if not already enabled)
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create policies that don't exist yet (using DO blocks to avoid conflicts)
DO $$ 
BEGIN
    -- Create policy to allow users to view their own campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Users can view own campaigns') THEN
        CREATE POLICY "Users can view own campaigns" 
        ON public.campaigns 
        FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;

    -- Create policy to allow users to create their own campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Users can create own campaigns') THEN
        CREATE POLICY "Users can create own campaigns" 
        ON public.campaigns 
        FOR INSERT 
        WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Create policy to allow users to update their own campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Users can update own campaigns') THEN
        CREATE POLICY "Users can update own campaigns" 
        ON public.campaigns 
        FOR UPDATE 
        USING (auth.uid() = user_id);
    END IF;

    -- Create policy to allow users to delete their own campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Users can delete own campaigns') THEN
        CREATE POLICY "Users can delete own campaigns" 
        ON public.campaigns 
        FOR DELETE 
        USING (auth.uid() = user_id);
    END IF;
END $$;

-- Ensure rollandmanilla@gmail.com has admin role
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::app_role
FROM public.profiles 
WHERE email = 'rollandmanilla@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
