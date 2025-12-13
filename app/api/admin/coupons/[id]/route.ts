import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    let supabase: any
    try {
      supabase = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ error: "Admin client not available" }, { status: 401 })
    }
    const { data, error } = await supabase.from("coupons").select("*").eq("id", id).single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error("GET /api/admin/coupons/[id]", err)
    return NextResponse.json({ error: "unexpected" }, { status: 500 })
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await req.json()
    let supabase: any
    try {
      supabase = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ error: "Admin client not available" }, { status: 401 })
    }
    const update = { ...body, updated_at: new Date().toISOString() }
    const { data, error } = await supabase.from("coupons").update(update).eq("id", id).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data })
  } catch (err) {
    console.error("PATCH /api/admin/coupons/[id]", err)
    return NextResponse.json({ error: "unexpected" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    let supabase: any
    try {
      supabase = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ error: "Admin client not available" }, { status: 401 })
    }
    const { error } = await supabase.from("coupons").delete().eq("id", id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("DELETE /api/admin/coupons/[id]", err)
    return NextResponse.json({ error: "unexpected" }, { status: 500 })
  }
}
