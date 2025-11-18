'use client'

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import type { Database } from '../database.types'

let cached: ReturnType<typeof _createBrowserClient> | null = null

export const createBrowserClient = () => {
  if (cached) return cached
  cached = _createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  return cached
}

export default createBrowserClient
