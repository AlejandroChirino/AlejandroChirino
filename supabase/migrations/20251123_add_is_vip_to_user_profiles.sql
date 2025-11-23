-- Add is_vip boolean to user_profiles if missing
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS is_vip boolean DEFAULT false;
