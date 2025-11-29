import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
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
    const supabase = getSupabaseAdmin()
    const result = await computeCouponDiscount({ admin: supabase, code, items, subtotal, deliveryCost, user_id })
    if (!result) return NextResponse.json({ valid: false, reason: 'Error interno' }, { status: 500 })
    return NextResponse.json(result)
  } catch (err) {
    console.error("/api/coupons/validate error", err)
    return NextResponse.json({ valid: false, reason: "Error interno" }, { status: 500 })
  }
}
