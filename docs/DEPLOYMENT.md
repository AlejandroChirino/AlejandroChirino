**Deployment & Secrets — La Fashion**

- **Propósito:** este documento resume cómo manejar la `SUPABASE_SERVICE_ROLE_KEY` y la bandera `ALLOW_ADMIN_FALLBACK` para evitar errores 500 en rutas admin cuando la clave de servicio no está presente, y cómo probar localmente.

**1) Principios de seguridad**
- Nunca subir `SUPABASE_SERVICE_ROLE_KEY` a git ni almacenarla en archivos que puedan compartirse.
- La `SUPABASE_SERVICE_ROLE_KEY` es una credencial privilegiada (service role). Trátala como un secreto de nivel alto.
- Usar la clave de servicio solo en procesos servidor/CI controlados. En producción, configura la clave como "secret" en tu proveedor (Vercel, Netlify, Fly, Render, etc.).
- En producción: preferir llamadas con sesión (RLS) y no usar `ALLOW_ADMIN_FALLBACK`.

**2) Variables de entorno usadas por el proyecto**
- `NEXT_PUBLIC_SUPABASE_URL` — URL pública del proyecto Supabase.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — clave pública (no privilegiada) usada en cliente.
- `SUPABASE_SERVICE_ROLE_KEY` — clave service-role (privilegiada). NO PONER en repo.
- `ALLOW_ADMIN_FALLBACK` — bandera opcional que permite que el código use `SUPABASE_SERVICE_ROLE_KEY` como fallback en entornos de desarrollo cuando no hay sesión.

Recomendación:
- En producción: NO establecer `ALLOW_ADMIN_FALLBACK` (o establecer a "false"). Guardar `SUPABASE_SERVICE_ROLE_KEY` en el gestor de secretos del proveedor.
- En desarrollo local: si necesitas ejecutar herramientas admin sin iniciar sesión como admin, copia la clave a un `.env.local` local y pon `ALLOW_ADMIN_FALLBACK=true`. **No** comites ese archivo.

**3) Ejemplo de `.env.local` (local, NO comitear)**
\`\`\`
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...anon...
SUPABASE_SERVICE_ROLE_KEY=eyJ...service-role...
ALLOW_ADMIN_FALLBACK=true
\`\`\`
- Añade `.env.local` a `.gitignore` si no lo tienes.

**4) Cómo ejecutar localmente (Windows PowerShell)**
- Instalar dependencias: `pnpm install` (o `npm install`).
- Iniciar dev server: `pnpm dev`.
- Probar flujos con los scripts incluidos (autenticación + sync cookie):
  - `.	emplates\scripts\test-cart.ps1` — autentica, sincroniza cookie y POST a `/api/cart`.
  - `.	emplates\scripts\test-favorites.ps1` — autentica y prueba `/api/favorites`.

Nota: los scripts usan la API pública (`NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`) para autenticar y luego POST a `POST /api/auth/sync` para que el servidor pueda leer la cookie HttpOnly.

**5) Comportamiento esperado del código**
- Las rutas ahora usan un patrón "session-first": intentan usar `createServerClient()` (cliente sesión). Si no hay sesión y `ALLOW_ADMIN_FALLBACK=='true'` y `SUPABASE_SERVICE_ROLE_KEY` existe, el helper `lib/adminClient.ts` devolverá el cliente admin.
- Si no hay cliente admin disponible, las rutas admin retornan respuestas controladas (`401`, `503` o una configuración por defecto) en lugar de lanzar 500 y romper la app.

**6) Buenas prácticas de deploy**
- En el panel del hosting (Vercel, Netlify, etc.), añade `SUPABASE_SERVICE_ROLE_KEY` como "secret"/environment variable.
- No habilitar `ALLOW_ADMIN_FALLBACK` en producción.
- Asegúrate de que las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén presentes en el entorno de producción.

**7) Troubleshooting rápido**
- Si ves errores `new row violates row-level security policy` (código Postgres `42501`): significa que la inserción intentó usar un cliente sin sesión (RLS bloqueó la operación). Solución: autenticar (sincronizar cookie) o habilitar admin fallback en dev.
- Si ves errores sobre cliente admin mal configurado: verifica que `SUPABASE_SERVICE_ROLE_KEY` esté presente en el entorno.

**8) Siguientes pasos recomendados**
- Mantener `ALLOW_ADMIN_FALLBACK` desactivado en entornos públicos.
- Revisar y remover cualquier clave en historial Git (si alguna vez estuvo commiteada) — usar herramientas como `git-secrets`, `bfg` o contactar soporte si fue expuesta.

---
Si quieres, genero un `README` corto con los comandos de prueba exactos (PowerShell + ejemplo `.env.local`) y el mensaje de commit sugerido.¿Lo agrego ahora?
