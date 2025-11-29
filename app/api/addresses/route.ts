import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (id) {
      const { data, error } = await supabase.from("user_addresses").select("*").eq("id", id).eq("user_id", userId).single()
      if (error) return NextResponse.json({ error: "Error fetching address" }, { status: 500 })
      return NextResponse.json(data)
    }

    const { data: addresses, error } = await supabase.from("user_addresses").select("*").eq("user_id", userId).order("is_default", { ascending: false }).order("created_at", { ascending: false })
    if (error) return NextResponse.json({ error: "Error fetching addresses" }, { status: 500 })
    return NextResponse.json(addresses)
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
    const { alias, recipient, line1, line2, city, postal, country, isDefault } = body

    // If isDefault, clear other defaults
    if (isDefault) {
      await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId)
    }

    const { data, error } = await supabase.from("user_addresses").insert([{ user_id: userId, alias, recipient, line1, line2, city, postal, country, is_default: isDefault ?? false }]).select().single()
    if (error) return NextResponse.json({ error: "Error creating address" }, { status: 500 })
    return NextResponse.json(data, { status: 201 })
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData?.user?.id
    if (!userId) return NextResponse.json({ error: "Not authenticated" }, { status: 401 })

    const body = await request.json()
    const { id, alias, recipient, line1, line2, city, postal, country, isDefault } = body
    if (!id) return NextResponse.json({ error: "Address id is required" }, { status: 400 })

    // Ensure row belongs to user
    const { data: existing, error: selErr } = await supabase.from("user_addresses").select("user_id").eq("id", id).single()
    if (selErr || !existing || existing.user_id !== userId) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 })

    if (isDefault) {
      await supabase.from("user_addresses").update({ is_default: false }).eq("user_id", userId)
    }

    const { data, error } = await supabase.from("user_addresses").update({ alias, recipient, line1, line2, city, postal, country, is_default: isDefault ?? false }).eq("id", id).select().single()
    if (error) return NextResponse.json({ error: "Error updating address" }, { status: 500 })
    return NextResponse.json(data)
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
    if (!id) return NextResponse.json({ error: "Address id is required" }, { status: 400 })

    const { error } = await supabase.from("user_addresses").delete().eq("id", id).eq("user_id", userId)
    if (error) return NextResponse.json({ error: "Error deleting address" }, { status: 500 })
    return NextResponse.json({ message: "Deleted" })
  } catch (e) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
