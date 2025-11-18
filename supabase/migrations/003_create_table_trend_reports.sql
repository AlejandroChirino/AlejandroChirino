-- Crear tabla trend_reports para gestionar tendencias destacadas
-- Ejecutar en el SQL editor de Supabase o como migration

-- Asegurarse de tener la extensión para generar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.trend_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  position integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Índice para ordenamiento por posición
CREATE INDEX IF NOT EXISTS idx_trend_reports_position ON public.trend_reports(position);

-- Nota: inserta hasta 4 filas para usarlas en la sección 'TENDENCIAS DESTACADAS'.
