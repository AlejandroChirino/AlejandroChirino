-- Create a view that joins orders with user_profiles to simplify admin queries
CREATE OR REPLACE VIEW public.orders_with_profiles AS
SELECT
  o.id,
  o.user_id,
  o.total,
  o.status,
  o.shipping_address,
  o.created_at,
  up.full_name,
  up.email
FROM public.orders o
LEFT JOIN public.user_profiles up ON up.id = o.user_id;

-- Grant select to anon and authenticated roles if needed (commented out by default)
-- GRANT SELECT ON public.orders_with_profiles TO authenticated;
-- GRANT SELECT ON public.orders_with_profiles TO anon;
