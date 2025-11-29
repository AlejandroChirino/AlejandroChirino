-- Migration: create coupons table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  type text NOT NULL,
  amount numeric DEFAULT NULL,
  products uuid[] DEFAULT ARRAY[]::uuid[],
  categories text[] DEFAULT ARRAY[]::text[],
  subcategories text[] DEFAULT ARRAY[]::text[],
  brands text[] DEFAULT ARRAY[]::text[],
  tags text[] DEFAULT ARRAY[]::text[],
  min_purchase numeric DEFAULT 0,
  max_uses integer DEFAULT NULL,
  usage_count integer DEFAULT 0,
  expires_at timestamptz DEFAULT NULL,
  active boolean DEFAULT true,
  created_by uuid DEFAULT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons (lower(code));
CREATE INDEX IF NOT EXISTS idx_coupons_products ON public.coupons USING GIN (products);
CREATE INDEX IF NOT EXISTS idx_coupons_tags ON public.coupons USING GIN (tags);
