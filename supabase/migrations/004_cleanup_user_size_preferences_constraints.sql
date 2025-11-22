-- Cleanup script to remove duplicate constraints that may block the migration
-- Safe to run: uses IF EXISTS. Run this once before applying the patched migration.

BEGIN;

ALTER TABLE IF EXISTS public.user_size_preferences DROP CONSTRAINT IF EXISTS user_size_preferences_user_fk;
ALTER TABLE IF EXISTS public.user_size_preferences DROP CONSTRAINT IF EXISTS uniq_user_cat_sub;
ALTER TABLE IF EXISTS public.user_size_preferences DROP CONSTRAINT IF EXISTS sizes_max_three;

-- If trigger exists and is misconfigured, re-create the timestamp trigger (optional)
DROP TRIGGER IF EXISTS set_timestamp ON public.user_size_preferences;

COMMIT;
