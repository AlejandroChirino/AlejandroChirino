import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function GET() {
  try {
    let supabase
    try {
      supabase = await getAdminDb()
    } catch (e: any) {
      console.error("GET /api/admin/coupons init error", e?.message || e)
      return NextResponse.json({ error: e?.message || "admin client not available" }, { status: 401 })
    }
    const { data, error } = await supabase.from("coupons").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("GET /api/admin/coupons error", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ data })
  } catch (err) {
    console.error("GET /api/admin/coupons unexpected", err)
    return NextResponse.json({ error: "unexpected" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    let supabase
    try {
      supabase = await getAdminDb()
    } catch (e: any) {
      console.error("POST /api/admin/coupons init error", e?.message || e)
      return NextResponse.json({ error: e?.message || "admin client not available" }, { status: 401 })
    }

    // Only include columns that exist in the `coupons` table schema
    const data: any = {
      code: body.code || null,
      type: body.type || null,
      amount: body.value ?? body.amount ?? null,
      products: body.applies_to_products || body.products || [],
      categories: body.applies_to_categories || body.categories || [],
      subcategories: body.applies_to_subcategories || body.subcategories || [],
      brands: body.applies_to_brand ? [body.applies_to_brand] : body.brands || [],
      tags: body.applies_to_tags || body.tags || [],
      min_purchase: body.min_purchase ?? null,
      max_uses: body.limit_global ?? null,
      expires_at: body.end_at || null,
      active: typeof body.active === "boolean" ? body.active : true,
      updated_at: new Date().toISOString(),
      created_by: body.created_by || null,
    }

    if (body.id) {
      const { data: updated, error } = await supabase.from("coupons").update(data).eq("id", body.id).select().single()
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ data: updated })
    }

    const insertBody = { ...data, created_at: new Date().toISOString() }
    const { data: inserted, error } = await supabase.from("coupons").insert([insertBody]).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ data: inserted })
  } catch (err) {
    console.error("POST /api/admin/coupons unexpected", err)
    return NextResponse.json({ error: "unexpected" }, { status: 500 })
  }
}
