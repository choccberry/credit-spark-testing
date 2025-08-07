-- Insert sample states for United States (assuming it exists)
-- First, let's check if we have a United States country
DO $$
DECLARE
    us_country_id UUID;
    ng_country_id UUID;
    uk_country_id UUID;
BEGIN
    -- Get US country ID if it exists
    SELECT id INTO us_country_id FROM public.countries WHERE code = 'US' LIMIT 1;
    
    IF us_country_id IS NOT NULL THEN
        -- Insert US states
        INSERT INTO public.states (country_id, name, code) VALUES
        (us_country_id, 'California', 'CA'),
        (us_country_id, 'New York', 'NY'),
        (us_country_id, 'Texas', 'TX'),
        (us_country_id, 'Florida', 'FL'),
        (us_country_id, 'Illinois', 'IL')
        ON CONFLICT (country_id, code) DO NOTHING;
        
        -- Insert some cities for California
        INSERT INTO public.cities (state_id, country_id, name)
        SELECT s.id, us_country_id, city_name
        FROM public.states s
        CROSS JOIN (VALUES 
            ('Los Angeles'),
            ('San Francisco'),
            ('San Diego'),
            ('Sacramento'),
            ('Oakland')
        ) AS cities(city_name)
        WHERE s.country_id = us_country_id AND s.code = 'CA';
        
        -- Insert some cities for New York
        INSERT INTO public.cities (state_id, country_id, name)
        SELECT s.id, us_country_id, city_name
        FROM public.states s
        CROSS JOIN (VALUES 
            ('New York City'),
            ('Buffalo'),
            ('Rochester'),
            ('Syracuse'),
            ('Albany')
        ) AS cities(city_name)
        WHERE s.country_id = us_country_id AND s.code = 'NY';
    END IF;
    
    -- Get Nigeria country ID if it exists
    SELECT id INTO ng_country_id FROM public.countries WHERE code = 'NG' LIMIT 1;
    
    IF ng_country_id IS NOT NULL THEN
        -- Insert Nigerian states
        INSERT INTO public.states (country_id, name, code) VALUES
        (ng_country_id, 'Lagos', 'LG'),
        (ng_country_id, 'Abuja', 'AB'),
        (ng_country_id, 'Kano', 'KN'),
        (ng_country_id, 'Rivers', 'RV'),
        (ng_country_id, 'Oyo', 'OY')
        ON CONFLICT (country_id, code) DO NOTHING;
        
        -- Insert cities for Lagos
        INSERT INTO public.cities (state_id, country_id, name)
        SELECT s.id, ng_country_id, city_name
        FROM public.states s
        CROSS JOIN (VALUES 
            ('Lagos Island'),
            ('Ikeja'),
            ('Surulere'),
            ('Victoria Island'),
            ('Lekki')
        ) AS cities(city_name)
        WHERE s.country_id = ng_country_id AND s.code = 'LG';
    END IF;
    
    -- Get UK country ID if it exists
    SELECT id INTO uk_country_id FROM public.countries WHERE code = 'GB' LIMIT 1;
    
    IF uk_country_id IS NOT NULL THEN
        -- Insert UK counties/regions
        INSERT INTO public.states (country_id, name, code) VALUES
        (uk_country_id, 'England', 'EN'),
        (uk_country_id, 'Scotland', 'SC'),
        (uk_country_id, 'Wales', 'WA'),
        (uk_country_id, 'Northern Ireland', 'NI')
        ON CONFLICT (country_id, code) DO NOTHING;
        
        -- Insert cities for England
        INSERT INTO public.cities (state_id, country_id, name)
        SELECT s.id, uk_country_id, city_name
        FROM public.states s
        CROSS JOIN (VALUES 
            ('London'),
            ('Manchester'),
            ('Birmingham'),
            ('Liverpool'),
            ('Leeds')
        ) AS cities(city_name)
        WHERE s.country_id = uk_country_id AND s.code = 'EN';
    END IF;
END $$;