import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getAdminDb } from "@/lib/adminClient"
import { randomUUID } from "crypto"
import { computeCouponDiscount, redeemCoupon } from "@/lib/coupons"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { items, shipping_address, customer, user_id, appliedCoupon } = body || {}

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "items required" }, { status: 400 })
    }

    const serverSupabase = await createServerClient()
    const { data: authData } = await serverSupabase.auth.getUser()
    const authUserId = (authData as any)?.user?.id

    // Prefer session-aware server client. If there's no session, allow admin
    // fallback only when explicitly enabled via env (and service role key present).
    let admin: any = serverSupabase
    if (!authUserId) {
      try {
        admin = await getAdminDb()
      } catch (e) {
        return NextResponse.json({ error: 'Not authenticated (no session) or admin client not available' }, { status: 401 })
      }
    }

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
        const details = process.env.NODE_ENV !== "production" ? (createErr?.message || (() => { try { return JSON.stringify(createErr) } catch (e) { return String(createErr) } })()) : undefined
        return NextResponse.json({ error: "Error creando perfil de invitado", details }, { status: 500 })
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

    // Compute totals
    const totalBefore = items.reduce((s: number, it: any) => s + (Number(it.price) * Number(it.quantity || 1)), 0)

    // Server-side coupon validation: if client sent an appliedCoupon (id or code), re-check it here via shared logic
    let totalDiscount = 0
    let applicableProductIds: string[] = []

    if (appliedCoupon && (appliedCoupon.id || appliedCoupon.code)) {
      try {
        // Fetch product metadata to pass into computeCouponDiscount
        const { data: productRows } = await admin.from("products").select("id,price,category,subcategoria,brand,tags").in("id", productIds)
        const prodMap: Record<string, any> = {}
        ;(productRows || []).forEach((p: any) => { prodMap[p.id] = p })

        const itemsForCompute = items.map((it: any) => ({ product: { id: it.product_id, price: it.price || prodMap[it.product_id]?.price, category: prodMap[it.product_id]?.category, subcategoria: prodMap[it.product_id]?.subcategoria, tags: prodMap[it.product_id]?.tags, brand: prodMap[it.product_id]?.brand }, quantity: it.quantity || 1 }))

        const computeRes = await computeCouponDiscount({ admin, code: appliedCoupon.code, coupon_id: appliedCoupon.id, items: itemsForCompute, subtotal: totalBefore, deliveryCost: 0, user_id: resolvedUserId })
        if (computeRes && computeRes.valid) {
          totalDiscount = Number(computeRes.discount || 0)
          applicableProductIds = computeRes.applicable_products || []
          appliedCoupon.id = appliedCoupon.id || computeRes.coupon?.id
          appliedCoupon.code = appliedCoupon.code || computeRes.coupon?.code
          appliedCoupon.description = appliedCoupon.description || computeRes.coupon?.description
        } else {
          // invalid coupon -> ignore
          totalDiscount = 0
          applicableProductIds = []
        }
      } catch (e) {
        console.error("Error validating coupon server-side:", e)
        totalDiscount = 0
        applicableProductIds = []
      }
    }

    const finalTotal = Math.max(0, totalBefore - totalDiscount)

    // Insert order using admin client (store final total and coupon metadata)
    const orderInsertPayload: any = {
      user_id: resolvedUserId,
      total: finalTotal,
      status: "pending",
      shipping_address,
      total_discount: totalDiscount,
    }
    if (appliedCoupon) {
      if (appliedCoupon.id) orderInsertPayload.coupon_id = appliedCoupon.id
      if (appliedCoupon.code) orderInsertPayload.coupon_code = appliedCoupon.code
      if (appliedCoupon.description) orderInsertPayload.coupon_description = appliedCoupon.description
    }

    const { data: orderData, error: orderError } = await admin.from("orders").insert(orderInsertPayload).select("id").single()
    if (orderError || !orderData) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Error creando orden" }, { status: 500 })
    }

    const order_id = orderData.id

    // Distribute discount among applicable items (proportional to item subtotal)
    const applicable = Array.isArray(applicableProductIds) ? applicableProductIds : []
    const subtotalApplicable = items.reduce((s: number, it: any) => {
      return s + (applicable.includes(it.product_id) ? Number(it.price) * Number(it.quantity || 1) : 0)
    }, 0)

    const itemsToInsert = items.map((it: any) => {
      const itemSubtotal = Number(it.price) * Number(it.quantity || 1)
      let discount_amount = 0
      if (totalDiscount > 0 && subtotalApplicable > 0 && applicable.includes(it.product_id)) {
        // proportional share
        discount_amount = Number(((itemSubtotal / subtotalApplicable) * totalDiscount).toFixed(2))
      }
      return {
        order_id,
        product_id: it.product_id,
        quantity: it.quantity || 1,
        price: it.price || 0,
        size: it.size ?? null,
        color: it.color ?? null,
        discount_amount: discount_amount,
      }
    })

    // Debug: log items to insert (trim large payloads)
    try { console.debug("order items to insert:", JSON.stringify(itemsToInsert).slice(0, 2000)) } catch (e) {}

    try {
      const { data: insertedItems, error: itemsError } = await admin.from("order_items").insert(itemsToInsert).select()
      if (itemsError) {
        console.error("Error inserting order items:", itemsError)
        try {
          await admin.from("orders").delete().eq("id", order_id)
        } catch (delErr) {
          console.warn("Failed to cleanup order after items insert error:", delErr)
        }
        const details = process.env.NODE_ENV !== "production" ? (itemsError?.message || (() => { try { return JSON.stringify(itemsError) } catch (e) { return String(itemsError) } })()) : undefined
        return NextResponse.json({ error: "Error inserting items", details }, { status: 500 })
      }
    } catch (e: any) {
      console.error("Unexpected exception inserting order items:", e)
      try {
        await admin.from("orders").delete().eq("id", order_id)
      } catch (delErr) {
        console.warn("Failed to cleanup order after items insert exception:", delErr)
      }
      const details = process.env.NODE_ENV !== "production" ? String(e) : undefined
      return NextResponse.json({ error: "Error inserting items", details }, { status: 500 })
    }

    // If coupon applied, register coupon use via centralized redeemCoupon (best-effort)
    try {
      if (appliedCoupon && (appliedCoupon.id || appliedCoupon.code)) {
        const { data: productRows } = await admin.from("products").select("id,price,category,subcategoria,brand,tags").in("id", productIds)
        const prodMap: Record<string, any> = {}
        ;(productRows || []).forEach((p: any) => { prodMap[p.id] = p })
        const itemsForRedeem = items.map((it: any) => ({ product: { id: it.product_id, price: it.price || prodMap[it.product_id]?.price, category: prodMap[it.product_id]?.category, subcategoria: prodMap[it.product_id]?.subcategoria, tags: prodMap[it.product_id]?.tags, brand: prodMap[it.product_id]?.brand }, quantity: it.quantity || 1 }))
        await redeemCoupon({ admin, code: appliedCoupon.code, coupon_id: appliedCoupon.id, items: itemsForRedeem, subtotal: totalBefore, deliveryCost: 0, user_id: resolvedUserId, order_id, metadata: { source: 'checkout_order_insert' } })
      }
    } catch (e) {
      console.error('failed to register coupon use via redeemCoupon:', e)
    }

    return NextResponse.json({ id: order_id }, { status: 201 })

  } catch (err: any) {
    console.error("Error in POST /api/orders:", err)
    return NextResponse.json({ error: "Error interno", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }

}
