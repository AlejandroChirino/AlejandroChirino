-- RLS policies for user_size_preferences: owners can CRUD, admins can manage

BEGIN;

-- Enable RLS
ALTER TABLE IF EXISTS public.user_size_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if present (makes migration idempotent)
DROP POLICY IF EXISTS "user_size_preferences_select_owner" ON public.user_size_preferences;
DROP POLICY IF EXISTS "user_size_preferences_insert_owner" ON public.user_size_preferences;
DROP POLICY IF EXISTS "user_size_preferences_update_owner" ON public.user_size_preferences;
DROP POLICY IF EXISTS "user_size_preferences_delete_owner" ON public.user_size_preferences;

-- Policy: allow owners to select their rows
CREATE POLICY "user_size_preferences_select_owner" ON public.user_size_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: allow owners to insert (they set user_id to their own uid)
CREATE POLICY "user_size_preferences_insert_owner" ON public.user_size_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: allow owners to update their own rows
CREATE POLICY "user_size_preferences_update_owner" ON public.user_size_preferences
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: allow owners to delete their own rows
CREATE POLICY "user_size_preferences_delete_owner" ON public.user_size_preferences
  FOR DELETE
  USING (auth.uid() = user_id);

-- Admin role (service role or explicitly allowed role) may bypass RLS via supabase admin client.

COMMIT;
