import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Tables, TablesUpdate, TablesInsert } from "@/lib/database.types"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: profile, error } = await supabase.from("user_profiles").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const updateData: TablesUpdate<"user_profiles"> = {
      ...(body as Partial<TablesUpdate<"user_profiles">>),
      updated_at: new Date().toISOString(),
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Error updating user profile" }, { status: 500 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
