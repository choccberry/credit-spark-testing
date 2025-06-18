
export interface Profile {
  id: string;
  user_id: string;
  username?: string;
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  credits: number;
  country_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
