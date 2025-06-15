-- Enable RLS on campaigns table
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Create admin policies (will skip if they already exist)
DO $$ 
BEGIN
    -- Create admin policies for profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can view all profiles') THEN
        CREATE POLICY "Admins can view all profiles" 
        ON public.profiles 
        FOR SELECT 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Admins can update all profiles') THEN
        CREATE POLICY "Admins can update all profiles" 
        ON public.profiles 
        FOR UPDATE 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    -- Create admin policies for campaigns
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Admins can view all campaigns') THEN
        CREATE POLICY "Admins can view all campaigns" 
        ON public.campaigns 
        FOR SELECT 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Admins can update all campaigns') THEN
        CREATE POLICY "Admins can update all campaigns" 
        ON public.campaigns 
        FOR UPDATE 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'campaigns' AND policyname = 'Admins can delete campaigns') THEN
        CREATE POLICY "Admins can delete campaigns" 
        ON public.campaigns 
        FOR DELETE 
        USING (public.has_role(auth.uid(), 'admin'));
    END IF;
END $$;