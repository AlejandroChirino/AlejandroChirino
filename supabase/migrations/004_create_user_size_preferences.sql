-- Create user_size_preferences table to store up to 3 preferred sizes per user+category+subcategory
-- Run this in Supabase SQL editor or via psql. Review before executing.

BEGIN;

-- Ensure gen_random_uuid() is available
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.user_size_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  subcategory text NOT NULL,
  sizes text[] NOT NULL DEFAULT ARRAY[]::text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_size_preferences_user_fk'
  ) THEN
    EXECUTE 'ALTER TABLE public.user_size_preferences ADD CONSTRAINT user_size_preferences_user_fk FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE';
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_user_size_preferences_user_id ON public.user_size_preferences(user_id);

-- Unique: one preference row per user+category+subcategory (create only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uniq_user_cat_sub'
  ) THEN
    EXECUTE 'ALTER TABLE public.user_size_preferences ADD CONSTRAINT uniq_user_cat_sub UNIQUE (user_id, category, subcategory)';
  END IF;
END
$$;

-- Enforce max 3 sizes (create constraint only if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sizes_max_three'
  ) THEN
    EXECUTE 'ALTER TABLE public.user_size_preferences ADD CONSTRAINT sizes_max_three CHECK (coalesce(array_length(sizes, 1), 0) <= 3)';
  END IF;
END
$$;

-- Trigger to keep updated_at current (re-creates function if not exists)
CREATE OR REPLACE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_timestamp ON public.user_size_preferences;
CREATE TRIGGER set_timestamp
BEFORE UPDATE ON public.user_size_preferences
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_timestamp();

COMMIT;
