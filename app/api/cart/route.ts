import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getAdminDb } from "@/lib/adminClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Prefer using the server-side supabase client (reads will respect RLS
    // and the user's session). Only if there is no session available and the
    // environment explicitly allows an admin fallback do we use the
    // service-role client.
    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const sessionUserId = authData?.user?.id ?? null

    let dbClient: any
    if (sessionUserId) {
      dbClient = serverSupabase
    } else {
      try {
        dbClient = await getAdminDb()
      } catch (err) {
        return NextResponse.json({ error: "Not authenticated (no session) or admin client not available" }, { status: 401 })
      }
    }

    const { data: cartItems, error } = await dbClient
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
    const body = await request.json()
    const userIdBody = body?.userId ?? body?.user_id ?? null
    const productId = body?.productId ?? body?.product_id ?? body?.product ?? null
    const quantity = body?.quantity ?? 1
    const size = body?.size
    const color = body?.color

    if (!productId) return NextResponse.json({ error: "Product ID is required" }, { status: 400 })

    // Prefer server session when available
    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const sessionUserId = authData?.user?.id ?? null

    let dbClient: any
    let finalUserId: string | null = null
    if (sessionUserId) {
      dbClient = serverSupabase
      finalUserId = sessionUserId
    } else if (userIdBody && process.env.NODE_ENV !== "production") {
      // Allow explicit userId from body in non-production for easier dev testing
      finalUserId = userIdBody
      try {
        dbClient = await getAdminDb()
      } catch (err) {
        return NextResponse.json({ error: "Not authenticated (no session) or admin client not available" }, { status: 401 })
      }
    } else {
      return NextResponse.json({ error: "Not authenticated (no session)" }, { status: 401 })
    }

    // Debug: log incoming intent
    try { console.log("POST /api/cart request", { finalUserId, productId, quantity, size, color, usingAdmin: dbClient !== undefined && !!process.env.SUPABASE_SERVICE_ROLE_KEY }) } catch (e) {}

    // Check if item exists
    let existingItem: any = null
    try {
      const res = await dbClient
        .from("cart_items")
        .select("*")
        .eq("user_id", finalUserId)
        .eq("product_id", productId)
        .eq("size", size || "")
        .eq("color", color || "")
        .maybeSingle()
      existingItem = res?.data ?? null
      if (res?.error) {
        console.error("Error querying existing cart item:", res.error)
        if (process.env.NODE_ENV !== "production") return NextResponse.json({ error: "Error querying existing cart item", details: JSON.parse(JSON.stringify(res.error)) }, { status: 500 })
        return NextResponse.json({ error: "Error querying existing cart item" }, { status: 500 })
      }
    } catch (e) {
      console.error("Unexpected error querying existing cart item:", e)
      if (process.env.NODE_ENV !== "production") return NextResponse.json({ error: "Unexpected error", details: String(e) }, { status: 500 })
      return NextResponse.json({ error: "Unexpected error" }, { status: 500 })
    }

    if (existingItem) {
      try {
        const upd = await dbClient
          .from("cart_items")
          .update({ quantity: existingItem.quantity + quantity, updated_at: new Date().toISOString() })
          .eq("id", existingItem.id)
          .select()
          .single()
        if (upd.error) {
          console.error("Error updating cart item:", upd.error)
          if (process.env.NODE_ENV !== "production") return NextResponse.json({ error: "Error updating cart item", details: JSON.parse(JSON.stringify(upd.error)) }, { status: 500 })
          return NextResponse.json({ error: "Error updating cart item" }, { status: 500 })
        }
        return NextResponse.json(upd.data)
      } catch (e) {
        console.error("Unexpected error updating cart item:", e)
        if (process.env.NODE_ENV !== "production") return NextResponse.json({ error: "Unexpected error updating", details: String(e) }, { status: 500 })
        return NextResponse.json({ error: "Unexpected error updating" }, { status: 500 })
      }
    }

    try {
      const ins = await dbClient
        .from("cart_items")
        .insert([{ user_id: finalUserId, product_id: productId, quantity, size, color }])
        .select()
        .single()
      if (ins.error) {
        console.error("Error inserting cart item:", ins.error)
        if (process.env.NODE_ENV !== "production") return NextResponse.json({ error: "Error adding cart item", details: JSON.parse(JSON.stringify(ins.error)) }, { status: 500 })
        return NextResponse.json({ error: "Error adding cart item" }, { status: 500 })
      }
      return NextResponse.json(ins.data, { status: 201 })
    } catch (e) {
      console.error("Unexpected error inserting cart item:", e)
      if (process.env.NODE_ENV !== "production") return NextResponse.json({ error: "Unexpected error inserting", details: String(e) }, { status: 500 })
      return NextResponse.json({ error: "Unexpected error inserting" }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
