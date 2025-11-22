-- Create user_addresses table to store multiple addresses per user
-- Run this in Supabase SQL editor or via psql. Review before executing.

BEGIN;

-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.user_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  alias text,
  recipient text,
  line1 text,
  line2 text,
  city text,
  postal text,
  country text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Foreign key to auth.users (Supabase-managed users table)
ALTER TABLE public.user_addresses
  ADD CONSTRAINT user_addresses_user_fk FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON public.user_addresses(user_id);

-- Trigger to keep updated_at current
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.user_addresses;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.user_addresses
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

-- Optional backfill: migrate single `address` column from user_profiles into user_addresses
-- This will create one address per user and mark it as default. Review before running.
INSERT INTO public.user_addresses (user_id, line1, is_default, created_at, updated_at)
SELECT id, address, true, now(), now()
FROM public.user_profiles
WHERE address IS NOT NULL AND trim(address) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.user_addresses ua WHERE ua.user_id = public.user_profiles.id
  );

COMMIT;
