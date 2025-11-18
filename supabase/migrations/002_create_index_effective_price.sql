-- Índice para acelerar búsquedas y ordenamientos por effective_price
-- Ejecutar en el SQL editor de Supabase o mediante tu sistema de migraciones

CREATE INDEX IF NOT EXISTS idx_products_effective_price ON public.products ((CASE WHEN on_sale AND sale_price IS NOT NULL THEN sale_price::numeric ELSE price::numeric END));

-- Nota: Este índice usa una expresión calculada; asegúrate de que tu versión de Postgres y Supabase lo soportan.
-- Alternativa (si tu proveedor no permite índices sobre expresiones cast):
-- 1) Añadir columna materializada `effective_price` y actualizarla en triggers o en el flujo de ETL
-- 2) Crear índice sobre esa columna materializada
