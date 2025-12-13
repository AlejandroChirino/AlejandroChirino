#!/usr/bin/env node
(async () => {
  try {
    const { createClient } = await import('@supabase/supabase-js')

    const SUPABASE_URL = process.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables')
      process.exit(1)
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    const cutoff = new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString()

    console.log('Marking products older than', cutoff, 'as not new (is_new = false)')

    // Attempt to return the updated rows (ids) so we can report the exact count.
    const { data, error } = await supabase
      .from('products')
      .update({ is_new: false })
      .lt('created_at', cutoff)
      .eq('is_new', true)
      .select('id')

    if (error) {
      console.error('Error marking expired is_new:', error)
      process.exit(2)
    }

    if (Array.isArray(data)) {
      console.log('Updated rows:', data.length)
    } else {
      // Fallback: run a count query to determine how many rows are now marked as not new.
      try {
        const countRes = await supabase
          .from('products')
          .select('id', { head: true, count: 'exact' })
          .lt('created_at', cutoff)
          .eq('is_new', false)

        console.log('Updated rows (fallback count):', countRes.count ?? 'unknown')
      } catch (e) {
        console.log('Updated rows: unknown')
      }
    }
    process.exit(0)
  } catch (e) {
    console.error('Unexpected error in mark-new-expired script:', e)
    process.exit(3)
  }
})()
