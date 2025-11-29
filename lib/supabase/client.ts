'use client'

// Re-use the single Supabase client created in `lib/supabaseClient.ts` to avoid
// multiple GoTrueClient instances in the same browser context.
import { safeSupabase } from '@/lib/supabaseClient'

export const createBrowserClient = () => {
  return safeSupabase
}

export default createBrowserClient
