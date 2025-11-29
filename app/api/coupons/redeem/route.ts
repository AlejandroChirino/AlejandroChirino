import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { redeemCoupon } from "@/lib/coupons"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, coupon_id, items = [], subtotal = 0, deliveryCost = 0, user_id = null, order_id = null, metadata = {} } = body

    if (!code && !coupon_id) return NextResponse.json({ success: false, reason: "code or coupon_id required" }, { status: 400 })

    const supabase = getSupabaseAdmin()
    const r = await redeemCoupon({ admin: supabase, code, coupon_id, items, subtotal, deliveryCost, user_id, order_id, metadata })
    if (!r) return NextResponse.json({ success: false, reason: 'Error interno' }, { status: 500 })
    return NextResponse.json(r)
  } catch (err) {
    console.error("/api/coupons/redeem error", err)
    return NextResponse.json({ success: false, reason: "Error interno" }, { status: 500 })
  }
}
