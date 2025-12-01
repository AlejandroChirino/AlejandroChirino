-- Add product_snapshot JSONB to order_items and make product_id nullable + ON DELETE SET NULL
BEGIN;

-- Add snapshot column to preserve product info when product is deleted
ALTER TABLE public.order_items
ADD COLUMN IF NOT EXISTS product_snapshot jsonb DEFAULT NULL;

-- Allow product_id to be nullable so deletes can set it to NULL
ALTER TABLE public.order_items
ALTER COLUMN product_id DROP NOT NULL;

-- Recreate FK constraint to set NULL on product delete
ALTER TABLE public.order_items
DROP CONSTRAINT IF EXISTS order_items_product_id_fkey;

ALTER TABLE public.order_items
ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;

COMMIT;
