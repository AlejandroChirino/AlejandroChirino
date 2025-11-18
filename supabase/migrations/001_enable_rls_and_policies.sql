-- 001_enable_rls_and_policies.sql
-- Habilita Row Level Security (RLS) y crea políticas básicas
-- Ajusta según tu esquema si hace falta. Haz BACKUP antes de ejecutar.

-- Asegurarse de que la columna role existe en user_profiles
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Habilitar RLS en tablas sensibles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Policies para user_profiles: el dueño puede ver/editar su perfil
DROP POLICY IF EXISTS "Profiles: owner can select" ON public.user_profiles;
CREATE POLICY "Profiles: owner can select" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: owner can update" ON public.user_profiles;
CREATE POLICY "Profiles: owner can update" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Profiles: owner can insert" ON public.user_profiles;
CREATE POLICY "Profiles: owner can insert" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policies para cart_items: dueño o admin
DROP POLICY IF EXISTS "Cart: owner or admin can manage" ON public.cart_items;
CREATE POLICY "Cart: owner or admin can manage" ON public.cart_items
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- Policies para favorites: dueño o admin
DROP POLICY IF EXISTS "Favorites: owner or admin can manage" ON public.favorites;
CREATE POLICY "Favorites: owner or admin can manage" ON public.favorites
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- Policies para orders: dueño o admin
DROP POLICY IF EXISTS "Orders: owner or admin select" ON public.orders;
CREATE POLICY "Orders: owner or admin select" ON public.orders
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

DROP POLICY IF EXISTS "Orders: owner or admin insert" ON public.orders;
CREATE POLICY "Orders: owner or admin insert" ON public.orders
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

DROP POLICY IF EXISTS "Orders: owner or admin update" ON public.orders;
CREATE POLICY "Orders: owner or admin update" ON public.orders
  FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM public.user_profiles up WHERE up.id = auth.uid() AND up.role = 'admin')
  );

-- Nota: Las políticas usan la función auth.uid() para comparar con las columnas id/user_id.
-- Si tu esquema usa nombres distintos, adapta las consultas antes de ejecutar.
