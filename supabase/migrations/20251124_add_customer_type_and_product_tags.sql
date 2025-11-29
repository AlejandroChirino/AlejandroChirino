-- Migration: añadir customer_type a users y tags a products
-- Ejecutar en la base de datos de Supabase/Postgres

BEGIN;

-- 1) Añadir columna customer_type a la tabla users (tipo de cliente)
-- Nota: la tabla de usuarios se llama `user_profiles` en este proyecto
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS customer_type text DEFAULT NULL;

-- Índice para consultas por tipo de cliente (opcional)
CREATE INDEX IF NOT EXISTS idx_user_profiles_customer_type ON public.user_profiles (customer_type);

-- 2) Añadir columna tags a products (array de texto)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

-- Índice GIN para búsquedas por tags
CREATE INDEX IF NOT EXISTS idx_products_tags_gin ON public.products USING GIN (tags);

COMMIT;
