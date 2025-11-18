-- 002_auth_user_profile_trigger.sql
-- Crea una función/trigger para insertar automáticamente un registro en user_profiles
-- cuando se crea un nuevo usuario en auth.users

-- Asegurarse de que la columna role existe (por si no se ejecutó la migración anterior)
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, created_at, role)
  VALUES (NEW.id, NEW.email::text, now(), 'user')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger en auth.users
DROP TRIGGER IF EXISTS create_user_profile ON auth.users;
CREATE TRIGGER create_user_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
