import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const { is_vip, tags } = body || {}

    // Build update payload
    const payload: any = {}
    if (typeof is_vip === "boolean") payload.is_vip = is_vip
    if (Array.isArray(tags)) payload.tags = tags

    if (Object.keys(payload).length === 0) return NextResponse.json({ error: "nothing to update" }, { status: 400 })

    const admin = getSupabaseAdmin()
    const { data, error } = await admin.from("user_profiles").update(payload).eq("id", id).select("id,is_vip,tags").maybeSingle()
    if (error) {
      console.error("Error updating profile:", error)
      return NextResponse.json({ error: "Error updating profile" }, { status: 500 })
    }

    return NextResponse.json({ ok: true, profile: data })
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/clientes/[id]:", err)
    return NextResponse.json({ error: "Internal error", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

    const admin = getSupabaseAdmin()

    // Fetch profile (use select('*') to avoid errors if schema differs)
    const { data: profile, error: profileErr } = await admin
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (profileErr) {
      console.error('Error fetching profile:', profileErr)
      return NextResponse.json({ error: 'Error fetching profile', details: String(profileErr) }, { status: 500 })
    }

    // Fetch recent orders
    let orders: any[] = []
    try {
      const { data: ordersData, error: ordersErr } = await admin
        .from('orders')
        .select('id, total, status, created_at')
        .eq('user_id', id)
        .order('created_at', { ascending: false })
        .limit(20)
      if (ordersErr) {
        console.error('Error fetching orders for profile:', ordersErr)
      } else {
        orders = ordersData || []
      }
    } catch (e) {
      console.error('Orders query failed', e)
    }

    // Fetch addresses if table exists
    let addresses = null
    try {
      const { data: addr, error: addrErr } = await admin.from('addresses').select('*').eq('user_id', id)
      if (addrErr) {
        console.warn('Could not fetch addresses:', addrErr)
      } else {
        addresses = addr
      }
    } catch (e) {
      // ignore
      console.warn('Addresses fetch failed', e)
    }

    return NextResponse.json({ profile, orders: orders || [], addresses })
  } catch (err: any) {
    console.error('Error in GET /api/admin/clientes/[id]:', err)
    return NextResponse.json({ error: 'Internal error', details: process.env.NODE_ENV !== 'production' ? String(err) : undefined }, { status: 500 })
  }
}
