import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const { data: orders, error } = await supabase
      .from("orders")
      .select(
        `
        id,
        total,
        status,
        shipping_address,
        created_at,
        updated_at,
        order_items (
          id,
          quantity,
          price,
          size,
          color,
          products (
            id,
            name,
            image_url
          )
        )
      `,
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: "Error fetching orders" }, { status: 500 })
    }

    return NextResponse.json(orders)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, cartItems, shippingAddress, total } = await request.json()

    if (!userId || !cartItems || !shippingAddress || !total) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          user_id: userId,
          total,
          shipping_address: shippingAddress,
          status: "pending",
        },
      ])
      .select()
      .single()

    if (orderError) {
      return NextResponse.json({ error: "Error creating order" }, { status: 500 })
    }

    // Crear los items del pedido
    const orderItems = cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.products.price,
      size: item.size,
      color: item.color,
    }))

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

    if (itemsError) {
      return NextResponse.json({ error: "Error creating order items" }, { status: 500 })
    }

    // Limpiar el carrito
    const { error: clearCartError } = await supabase.from("cart_items").delete().eq("user_id", userId)

    if (clearCartError) {
      // No retornamos error aquí porque el pedido ya se creó
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
