import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import { randomUUID } from "crypto"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping_address, customer, user_id } = body || {}

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items required" }, { status: 400 })
    }

    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const authUserId = (authData as any)?.user?.id

    const admin = getSupabaseAdmin()

    // Determine user id to link the order to
    let resolvedUserId: string | null = null

    if (authUserId) {
      resolvedUserId = authUserId
    } else if (user_id) {
      // If client provided user_id (could be email), try to resolve
      const looksLikeEmail = typeof user_id === "string" && user_id.includes("@")
      if (looksLikeEmail) {
        const { data: profile } = await admin.from("user_profiles").select("id").eq("email", user_id).maybeSingle()
        if (profile && profile.id) resolvedUserId = profile.id
      } else {
        // assume uuid
        resolvedUserId = user_id
      }
    }

    // If still no user, create a guest profile row using admin client
    if (!resolvedUserId) {
      const { fullName, email, phone, address, city } = customer || {}
      const guestId = randomUUID()
      const insertPayload: any = {
        id: guestId,
        full_name: fullName || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        city: city || null,
      }
      const { data: created, error: createErr } = await admin.from("user_profiles").insert(insertPayload).select("id").maybeSingle()
      if (createErr) {
        console.error("Error creating guest profile:", createErr)
        return NextResponse.json({ error: "Error creando perfil de invitado" }, { status: 500 })
      }
      resolvedUserId = (created && (created as any).id) || guestId
    }

    // Validate product IDs exist
    const productIds = items.map((it: any) => it.product_id).filter(Boolean)
    if (productIds.length === 0) return NextResponse.json({ error: "items must include product_id" }, { status: 400 })

    const { data: existingProducts, error: prodErr } = await admin.from("products").select("id").in("id", productIds)
    if (prodErr) {
      console.error("Error checking products:", prodErr)
      return NextResponse.json({ error: "Error verificando productos" }, { status: 500 })
    }

    const existingIds = (existingProducts || []).map((p: any) => p.id)
    const missing = productIds.filter((pid: string) => !existingIds.includes(pid))
    if (missing.length > 0) return NextResponse.json({ error: "Algunos product_id no existen", missing }, { status: 400 })

    // Insert order using admin client
    const total = items.reduce((s: number, it: any) => s + (Number(it.price) * Number(it.quantity || 1)), 0)
    const { data: orderData, error: orderError } = await admin.from("orders").insert({ user_id: resolvedUserId, total, status: "pending", shipping_address }).select("id").single()
    if (orderError || !orderData) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Error creando orden" }, { status: 500 })
    }

    const order_id = orderData.id

    const itemsToInsert = items.map((it: any) => ({
      order_id,
      product_id: it.product_id,
      quantity: it.quantity || 1,
      price: it.price || 0,
      size: it.size || null,
      color: it.color || null,
    }))

    const { error: itemsError } = await admin.from("order_items").insert(itemsToInsert)
    if (itemsError) {
      console.error("Error inserting order items:", itemsError)
      try {
        await admin.from("orders").delete().eq("id", order_id)
      } catch (delErr) {
        console.warn("Failed to cleanup order after items insert error:", delErr)
      }
      return NextResponse.json({ error: "Error inserting items" }, { status: 500 })
    }

    return NextResponse.json({ id: order_id }, { status: 201 })

  } catch (err: any) {
    console.error("Error in POST /api/orders:", err)
    return NextResponse.json({ error: "Error interno", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }

}

