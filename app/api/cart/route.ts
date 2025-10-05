import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data: cartItems, error } = await supabase
      .from("cart_items")
      .select(
        `
        id,
        quantity,
        size,
        color,
        created_at,
        updated_at,
        products (
          id,
          name,
          description,
          price,
          image_url,
          category,
          stock
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error fetching cart items" }, { status: 500 })
    }

    return NextResponse.json(cartItems)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, productId, quantity = 1, size, color } = await request.json()

    if (!userId || !productId) {
      return NextResponse.json({ error: "User ID and Product ID are required" }, { status: 400 })
    }

    // Verificar si el item ya existe en el carrito
    const { data: existingItem } = await supabase
      .from("cart_items")
      .select("*")
      .eq("user_id", userId)
      .eq("product_id", productId)
      .eq("size", size || "")
      .eq("color", color || "")
      .single()

    if (existingItem) {
      // Actualizar cantidad si ya existe
      const { data: updatedItem, error } = await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingItem.id)
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "Error updating cart item" }, { status: 500 })
      }

      return NextResponse.json(updatedItem)
    } else {
      // Crear nuevo item
      const { data: cartItem, error } = await supabase
        .from("cart_items")
        .insert([{ user_id: userId, product_id: productId, quantity, size, color }])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: "Error adding cart item" }, { status: 500 })
      }

      return NextResponse.json(cartItem, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
