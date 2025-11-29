import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
    const nodeEnv = process.env.NODE_ENV || null
    const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY

    // Try to create admin client and query the view
    let viewResult: any = { exists: false }
    try {
      const supabase = getSupabaseAdmin()
      const { data, error } = await supabase
        .from("orders_with_profiles")
        .select("id,full_name,email")
        .limit(1)
        .maybeSingle()

      if (error) {
        viewResult = { exists: false, error }
      } else if (data) {
        viewResult = { exists: true, sample: data }
      } else {
        viewResult = { exists: true, sample: null }
      }
    } catch (err: any) {
      viewResult = { exists: false, error: String(err) }
    }

    return NextResponse.json({
      ok: true,
      env: { nodeEnv, supabaseUrl, hasServiceKey },
      view: viewResult,
    })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
