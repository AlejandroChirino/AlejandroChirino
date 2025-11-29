-- Migration: create coupon_uses table
CREATE TABLE IF NOT EXISTS public.coupon_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id uuid DEFAULT NULL,
  order_id uuid DEFAULT NULL,
  used_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_coupon_uses_coupon_id ON public.coupon_uses(coupon_id);
CREATE INDEX IF NOT EXISTS idx_coupon_uses_user_id ON public.coupon_uses(user_id);
