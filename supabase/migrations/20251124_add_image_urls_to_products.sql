-- Add image_urls column to products and migrate existing image_url values
BEGIN;

ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}'::text[];

-- Migrate existing single image_url values into the array (first position)
UPDATE products
SET image_urls = CASE WHEN image_url IS NOT NULL AND image_url <> '' THEN ARRAY[image_url]::text[] ELSE '{}'::text[] END
WHERE image_url IS NOT NULL;

COMMIT;

-- NOTE: After deploying this migration, admin endpoints will begin writing to `image_urls`.
