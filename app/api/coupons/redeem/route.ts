import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"
import { redeemCoupon } from "@/lib/coupons"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, coupon_id, items = [], subtotal = 0, deliveryCost = 0, user_id = null, order_id = null, metadata = {} } = body

    if (!code && !coupon_id) return NextResponse.json({ success: false, reason: "code or coupon_id required" }, { status: 400 })

    let admin: any
    try {
      admin = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ success: false, reason: 'No autorizado o admin client no disponible' }, { status: 401 })
    }

    const r = await redeemCoupon({ admin, code, coupon_id, items, subtotal, deliveryCost, user_id, order_id, metadata })
    if (!r) return NextResponse.json({ success: false, reason: 'Error interno' }, { status: 500 })
    return NextResponse.json(r)
  } catch (err) {
    console.error("/api/coupons/redeem error", err)
    return NextResponse.json({ success: false, reason: "Error interno" }, { status: 500 })
  }
}
