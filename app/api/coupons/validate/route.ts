import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"
import { createServerClient } from "@/lib/supabase/server"
import { computeCouponDiscount } from "@/lib/coupons"

type ReqItem = {
  product: {
    id: string
    price: number
    category?: string
    subcategoria?: string | null
    tags?: string[]
    brand?: string | null
  }
  quantity: number
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { code, items, subtotal = 0, deliveryCost = 0, user_id = null } = body

    if (!code) return NextResponse.json({ valid: false, reason: "Código requerido" }, { status: 400 })

    // Prefer session-aware server client so RLS applies. Only use admin client
    // as a fallback if computeCouponDiscount fails and admin fallback is enabled.
    const serverSupabase = await createServerClient()
    let result: any = null

    try {
      result = await computeCouponDiscount({ admin: serverSupabase, code, items, subtotal, deliveryCost, user_id })
    } catch (err) {
      console.warn('/api/coupons/validate: computeCouponDiscount failed with server client, error:', err)
      try {
        const admin = await getAdminDb()
        result = await computeCouponDiscount({ admin, code, items, subtotal, deliveryCost, user_id })
      } catch (adminErr) {
        console.error('/api/coupons/validate: admin fallback failed', adminErr)
        return NextResponse.json({ valid: false, reason: 'Error interno' }, { status: 500 })
      }
    }

    if (!result) return NextResponse.json({ valid: false, reason: 'Error interno' }, { status: 500 })
    return NextResponse.json(result)
  } catch (err) {
    console.error("/api/coupons/validate error", err)
    return NextResponse.json({ valid: false, reason: "Error interno" }, { status: 500 })
  }
}
