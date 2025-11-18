import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Nota: Evitar throw en tiempo de import para no romper el build en Vercel.
// Creamos el cliente de forma perezosa cuando realmente se necesita (en una ruta/API del servidor).
let cachedClient: SupabaseClient<Database, "public"> | null = null

export function getSupabaseAdmin(): SupabaseClient<Database, "public"> {
  if (cachedClient) return cachedClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Supabase admin client misconfigured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in the environment."
    )
  }

  cachedClient = createClient<Database, "public">(supabaseUrl, serviceRoleKey)
  return cachedClient
}
