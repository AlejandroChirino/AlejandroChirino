import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const subcategory = searchParams.get("subcategory")

    let query = supabase.from("user_size_preferences").select("*").eq("user_id", userId)
    if (category) query = query.eq("category", category)
    if (subcategory) query = query.eq("subcategory", subcategory)

    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: "Error fetching preferences" }, { status: 500 })
    return NextResponse.json(data)
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const body = await request.json()
    const { category, subcategory, sizes } = body
    if (!category || !subcategory || !Array.isArray(sizes)) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

    // limit to max 3 sizes server-side
    const trimmed = sizes.slice(0, 3)

    // Try upsert: update existing row or insert
    const upsertData = { user_id: userId, category, subcategory, sizes: trimmed }

    // Using RPC-style upsert via select+insert/update to respect unique constraint
    const { data: existing } = await supabase.from("user_size_preferences").select("id").eq("user_id", userId).eq("category", category).eq("subcategory", subcategory).single()
    if (existing && existing.id) {
      const { data, error } = await supabase.from("user_size_preferences").update({ sizes: trimmed }).eq("id", existing.id).select().single()
      if (error) return NextResponse.json({ error: "Error updating preference" }, { status: 500 })
      return NextResponse.json(data)
    }

    const { data, error } = await supabase.from("user_size_preferences").insert([upsertData]).select().single()
    if (error) return NextResponse.json({ error: "Error creating preference" }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 })

    const { error } = await supabase.from("user_size_preferences").delete().eq("id", id).eq("user_id", userId)
    if (error) return NextResponse.json({ error: "Error deleting preference" }, { status: 500 })
    return NextResponse.json({ message: "Deleted" })
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
