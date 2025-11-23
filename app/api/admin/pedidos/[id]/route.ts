import { NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    if (!id) return NextResponse.json({ error: "order id required" }, { status: 400 })

    const body = await request.json().catch(() => ({}))
    const { status } = body || {}
    const allowed = ["pending", "processing", "shipped", "delivered", "cancelled"]
    if (!status || !allowed.includes(status)) {
      return NextResponse.json({ error: "invalid status" }, { status: 400 })
    }

    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select("id,status").maybeSingle()
    if (error) {
      console.error("Error updating order status:", error)
      return NextResponse.json({ error: "Error updating status" }, { status: 500 })
    }

    return NextResponse.json({ id: data?.id, status: data?.status })
  } catch (err: any) {
    console.error("Error in PATCH /api/admin/pedidos/[id]:", err)
    return NextResponse.json({ error: "Internal error", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }
}
