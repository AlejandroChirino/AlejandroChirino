import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Tables, TablesInsert, TablesUpdate } from "@/lib/database.types"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { quantity, size, color } = await request.json()

    const updateData: TablesUpdate<"cart_items"> = {
      quantity,
      size,
      color,
      updated_at: new Date().toISOString(),
    }

    const { data: cartItem, error } = await supabase
      .from("cart_items")
      .update(updateData as never)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: "Error updating cart item" }, { status: 500 })
    }

    return NextResponse.json(cartItem)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { error } = await supabase.from("cart_items").delete().eq("id", id)

    if (error) {
      return NextResponse.json({ error: "Error deleting cart item" }, { status: 500 })
    }

    return NextResponse.json({ message: "Cart item deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
