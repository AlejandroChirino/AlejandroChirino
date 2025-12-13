-- Add archived column to products for soft-delete/archiving
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS archived boolean DEFAULT false;

-- Optionally create an index to speed up queries that filter archived
CREATE INDEX IF NOT EXISTS idx_products_archived ON public.products (archived);
