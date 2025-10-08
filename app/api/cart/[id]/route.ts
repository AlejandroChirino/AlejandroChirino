import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { quantity, size, color } = await request.json()

    const { data: cartItem, error } = await supabase
      .from("cart_items")
      .update({
        quantity,
        size,
        color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("cart_items").delete().eq("id", params.id)

    if (error) {
      return NextResponse.json({ error: "Error deleting cart item" }, { status: 500 })
    }

    return NextResponse.json({ message: "Cart item deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
