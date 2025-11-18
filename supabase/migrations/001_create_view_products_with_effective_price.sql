-- Vista que expone `effective_price` para uso en queries y ordenamiento
-- Ejecutar en el SQL editor de Supabase o como migration

CREATE OR REPLACE VIEW public.products_with_effective_price AS
SELECT
  p.*,
  (CASE WHEN p.on_sale AND p.sale_price IS NOT NULL THEN p.sale_price::numeric ELSE p.price::numeric END) AS effective_price,
  md5(concat(p.id::text, '-', to_char(date_trunc('week', now()), 'YYYY-MM-DD'))) AS weekly_hash
FROM public.products p;

-- Índice recomendado para acelerar ordenamientos por effective_price (opcional):
-- CREATE INDEX IF NOT EXISTS idx_products_effective_price ON public.products ((CASE WHEN on_sale AND sale_price IS NOT NULL THEN sale_price ELSE price END));

-- Nota: ejecutar en la consola SQL de Supabase. Si usas migraciones, aplica según tu flujo.
