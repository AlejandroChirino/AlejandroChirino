-- Enable RLS and create policies for user_addresses
BEGIN;

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

-- Owner can select
DROP POLICY IF EXISTS "UserAddresses: owner select" ON public.user_addresses;
CREATE POLICY "UserAddresses: owner select" ON public.user_addresses
  FOR SELECT
  USING (auth.uid() = user_id);

-- Owner can insert (user_id must be auth.uid())
DROP POLICY IF EXISTS "UserAddresses: owner insert" ON public.user_addresses;
CREATE POLICY "UserAddresses: owner insert" ON public.user_addresses
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Owner can update
DROP POLICY IF EXISTS "UserAddresses: owner update" ON public.user_addresses;
CREATE POLICY "UserAddresses: owner update" ON public.user_addresses
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Owner can delete
DROP POLICY IF EXISTS "UserAddresses: owner delete" ON public.user_addresses;
CREATE POLICY "UserAddresses: owner delete" ON public.user_addresses
  FOR DELETE
  USING (auth.uid() = user_id);

-- Allow admins (user_profiles.role = 'admin') to manage
DROP POLICY IF EXISTS "UserAddresses: admin manage" ON public.user_addresses;
CREATE POLICY "UserAddresses: admin manage" ON public.user_addresses
  USING (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin'));

COMMIT;
