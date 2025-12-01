import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const params = url.searchParams
    const page = Number(params.get("page") || "1")
    const limit = Number(params.get("limit") || "20")
    const status = params.get("status")
    const search = params.get("search")
    const coupon = params.get("coupon")
    const minTotal = params.get("minTotal")
    const maxTotal = params.get("maxTotal")
    const dateRange = params.get("dateRange") // today,7,30,custom
    const sortBy = params.get("sortBy") || "created_at"
    const sortDir = params.get("sortDir") === "asc" ? "asc" : "desc"

    let db: any
    try {
      db = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ error: "No autorizado o cliente admin no disponible" }, { status: 401 })
    }

    // Query the pre-joined view for orders with profile info
    let query = db.from("orders_with_profiles")
      .select(`id,user_id,total,status,created_at,full_name,email,coupon_code,total_discount`, { count: "exact" })
      .order(sortBy as any, { ascending: sortDir === "asc" })

    // Filters
    if (status && status !== "all") query = query.eq("status", status)

    if (minTotal) query = query.gte("total", Number(minTotal))
    if (maxTotal) query = query.lte("total", Number(maxTotal))

    if (search) {
      // Search directly on the view (full_name or email)
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`)
    }

    // Coupon filter
    if (coupon) {
      // Allow partial match
      query = query.ilike("coupon_code", `%${coupon}%`)
    }

    // Date presets
    if (dateRange === "today") {
      const start = new Date()
      start.setHours(0, 0, 0, 0)
      query = query.gte("created_at", start.toISOString())
    } else if (dateRange === "7") {
      const start = new Date()
      start.setDate(start.getDate() - 7)
      query = query.gte("created_at", start.toISOString())
    } else if (dateRange === "30") {
      const start = new Date()
      start.setDate(start.getDate() - 30)
      query = query.gte("created_at", start.toISOString())
    }

    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("Error fetching orders from view:", error)
      if (process.env.NODE_ENV !== "production") {
        return NextResponse.json({ error: "Error al obtener órdenes", details: error }, { status: 500 })
      }
      return NextResponse.json({ error: "Error al obtener órdenes" }, { status: 500 })
    }

    const rows = data || []

    const orders = rows.map((row: any) => ({
      id: row.id,
      customer: row.full_name || row.email || row.user_id,
      email: row.email ?? null,
      total: row.total,
      status: row.status,
      created_at: row.created_at,
      coupon_code: row.coupon_code ?? null,
      total_discount: row.total_discount ?? 0,
    }))

    return NextResponse.json({ orders, pagination: { page, limit, total: count || 0, totalPages: Math.ceil((count || 0) / limit) } })
  } catch (err: any) {
    console.error("Error in GET /api/admin/pedidos:", err)

    // If the error is caused by missing env vars, include a helpful hint in dev
    const devDetails: any = {}
    if (process.env.NODE_ENV !== "production") {
      devDetails.nodeEnv = process.env.NODE_ENV
      devDetails.supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
      devDetails.hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
      devDetails.error = err && typeof err === "object" ? err : String(err)
    }

    return NextResponse.json(
      process.env.NODE_ENV !== "production"
        ? { error: "Error interno", details: devDetails }
        : { error: "Error interno" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { user_id, shipping_address, items } = body || {}

    if (!user_id) return NextResponse.json({ error: "user_id required" }, { status: 400 })
    if (!items || !Array.isArray(items) || items.length === 0) return NextResponse.json({ error: "items required" }, { status: 400 })

    let db2: any
    try {
      db2 = await getAdminDb()
    } catch (e) {
      return NextResponse.json({ error: "No autorizado o cliente admin no disponible" }, { status: 401 })
    }

    // If user_id is an email, try to resolve it to a uuid in user_profiles
    let resolvedUserId = user_id
    const looksLikeEmail = typeof user_id === "string" && user_id.includes("@")
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (looksLikeEmail) {
      const { data: profile, error: profileError } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("email", user_id)
        .maybeSingle()

      if (profileError) {
        console.error("Error looking up user by email:", profileError)
        return NextResponse.json({ error: "Error buscando usuario" , details: profileError }, { status: 500 })
      }

      if (!profile || !profile.id) {
        return NextResponse.json({ error: "Usuario no encontrado para el email proporcionado" }, { status: 400 })
      }

      resolvedUserId = profile.id
    }

    // Validate resolvedUserId is a UUID
    if (!uuidRegex.test(resolvedUserId)) {
      return NextResponse.json({ error: "user_id inválido, debe ser uuid o email válido" }, { status: 400 })
    }

    // Validate product IDs exist
    const productIds = items.map((it: any) => it.product_id).filter(Boolean)
    if (productIds.length === 0) return NextResponse.json({ error: "items must include product_id" }, { status: 400 })

    const { data: existingProducts, error: prodErr } = await db2
      .from("products")
      .select("id")
      .in("id", productIds)

    if (prodErr) {
      console.error("Error checking products:", prodErr)
      return NextResponse.json({ error: "Error verificando productos" , details: prodErr }, { status: 500 })
    }

    const existingIds = (existingProducts || []).map((p: any) => p.id)
    const missing = productIds.filter((pid: string) => !existingIds.includes(pid))
    if (missing.length > 0) {
      return NextResponse.json({ error: "Algunos product_id no existen", missing }, { status: 400 })
    }

    // Insert order
    const total = items.reduce((s: number, it: any) => s + (Number(it.price) * Number(it.quantity || 1)), 0)
    const { data: orderData, error: orderError } = await db2
      .from("orders")
      .insert({ user_id: resolvedUserId, total, status: "pending", shipping_address })
      .select("id")
      .single()

    if (orderError || !orderData) {
      console.error("Error creating order:", orderError)
      return NextResponse.json({ error: "Error creating order", details: orderError }, { status: 500 })
    }

    const order_id = orderData.id

    // Prepare order items
    const itemsToInsert = items.map((it: any) => ({
      order_id,
      product_id: it.product_id,
      quantity: it.quantity || 1,
      price: it.price || 0,
      size: it.size || null,
      color: it.color || null,
    }))

    const { error: itemsError } = await db2.from("order_items").insert(itemsToInsert)
    if (itemsError) {
      console.error("Error inserting order items:", itemsError)
      // attempt simple rollback: delete created order
      try {
        await supabase.from("orders").delete().eq("id", order_id)
      } catch (delErr) {
        console.warn("Failed to cleanup order after items insert error:", delErr)
      }
      return NextResponse.json({ error: "Error inserting items", details: itemsError }, { status: 500 })
    }

    return NextResponse.json({ id: order_id }, { status: 201 })
  } catch (err: any) {
    console.error("Error in POST /api/admin/pedidos:", err)
    return NextResponse.json({ error: "Error interno", details: process.env.NODE_ENV !== "production" ? String(err) : undefined }, { status: 500 })
  }
}
