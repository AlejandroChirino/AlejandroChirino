import { createClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable")
}

if (!supabaseAnonKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable")
}

// Safe fetch wrapper to avoid uncaught network errors bubbling from fetch (useful in dev/offline)
// This wrapper logs the error and returns a 502 JSON response instead of throwing, so callers
// (like @supabase/auth-js) receive a Response object and don't produce uncaught TypeErrors.
const safeFetch: typeof fetch = async (...args: Parameters<typeof fetch>) => {
  try {
    return await fetch(...args)
  } catch (err) {
    // Log for diagnostics but prevent the exception from bubbling
    // eslint-disable-next-line no-console
    console.error("supabase fetch failed:", err)
    return new Response(JSON.stringify({}), {
      status: 502,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Create a single Supabase client instance using the safe fetch wrapper so we don't create
// multiple GoTrueClient instances in the same browser context (which triggers warnings).
const _client = createClient<Database, "public">(supabaseUrl, supabaseAnonKey, {
  fetch: safeFetch,
})

export const supabase = _client
export const safeSupabase = _client
