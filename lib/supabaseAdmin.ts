import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Nota: Este archivo debe importarse sólo en código de servidor (API, acciones del servidor, etc.)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!serviceRoleKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable")
}

export const supabaseAdmin = createClient<Database, "public">(supabaseUrl, serviceRoleKey)
