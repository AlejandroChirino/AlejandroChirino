import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.debug("[api/create-profile] request body:", body)
    console.debug("[api/create-profile] env present:", {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    })
    const { id, email, full_name } = body || {}

    if (!id) {
      return NextResponse.json({ error: "missing user id" }, { status: 400 })
    }

    let supabase
    try {
      supabase = await getAdminDb()
    } catch (err: any) {
      console.error("[api/create-profile] admin client unavailable:", err)
      return NextResponse.json({ error: "Admin client unavailable" }, { status: 401 })
    }

    // Revisar si ya existe
    const { data: existing, error: selErr } = await supabase.from("user_profiles").select("id").eq("id", id).limit(1).maybeSingle()
    if (selErr) {
      console.error("[api/create-profile] select error:", selErr)
      return NextResponse.json({ error: selErr.message || "db select error", details: selErr }, { status: 500 })
    }

    if (existing) {
      return NextResponse.json({ message: "exists" }, { status: 200 })
    }

    const insertPayload: Record<string, any> = { id, email }
    if (full_name) insertPayload.full_name = full_name

    const { data, error } = await supabase.from("user_profiles").insert(insertPayload).select()
    if (error) {
      console.error("[api/create-profile] insert error:", error)
      return NextResponse.json({ error: error.message || "insert error", details: error }, { status: 500 })
    }

    console.debug("[api/create-profile] insert result:", data)
    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    console.error("[api/create-profile] unexpected error:", err)
    return NextResponse.json({ error: err?.message || String(err), stack: err?.stack }, { status: 500 })
  }
}
