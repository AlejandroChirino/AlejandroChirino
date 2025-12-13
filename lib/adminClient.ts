import { type NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getSupabaseAdmin } from '@/lib/supabaseAdmin'

type DbClient = any

/**
 * Return a DB client suitable for admin operations.
 * Preference order:
 * 1. If there's a logged-in session and the user has role 'admin', return the session-aware server client.
 * 2. If no session or user not admin, and ALLOW_ADMIN_FALLBACK==="true" and SUPABASE_SERVICE_ROLE_KEY present, return admin (service-role) client.
 * 3. Otherwise throw an Error('NO_ADMIN_CLIENT') so callers can return 401/503 as appropriate.
 */
export async function getAdminDb(request?: NextRequest): Promise<DbClient> {
  // Try server client (reads cookies via next/headers)
  try {
    const server = await createServerClient()
    const { data: authData } = await server.auth.getUser()
    const user = authData?.user ?? null
    if (user) {
      try {
        const { data: profile, error } = await server.from('user_profiles').select('role').eq('id', user.id).maybeSingle()
        if (!error && profile?.role === 'admin') {
          return server
        }
      } catch (e) {
        // ignore and try fallback
      }
    }
  } catch (e) {
    // ignore and try fallback
  }

  // Admin fallback only when explicitly enabled and key present
  const allowAdmin = !!process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.ALLOW_ADMIN_FALLBACK === 'true'
  if (allowAdmin) {
    try {
      return getSupabaseAdmin()
    } catch (e) {
      throw new Error('NO_ADMIN_CLIENT')
    }
  }

  throw new Error('NO_ADMIN_CLIENT')
}

export default getAdminDb
