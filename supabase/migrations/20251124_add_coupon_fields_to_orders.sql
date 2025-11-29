-- Migration: Add coupon fields to orders and discount_amount to order_items

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS coupon_id uuid NULL,
  ADD COLUMN IF NOT EXISTS coupon_code text NULL,
  ADD COLUMN IF NOT EXISTS coupon_description text NULL,
  ADD COLUMN IF NOT EXISTS total_discount numeric DEFAULT 0;

ALTER TABLE public.order_items
  ADD COLUMN IF NOT EXISTS discount_amount numeric DEFAULT 0;

-- Optional: update view orders_with_profiles if present
DROP VIEW IF EXISTS public.orders_with_profiles;

CREATE VIEW public.orders_with_profiles AS
SELECT
  o.id,
  o.user_id,
  o.total,
  o.status,
  o.shipping_address,
  o.created_at,
  o.coupon_code,
  o.total_discount,
  up.full_name,
  up.email
FROM public.orders o
LEFT JOIN public.user_profiles up ON up.id = o.user_id;
