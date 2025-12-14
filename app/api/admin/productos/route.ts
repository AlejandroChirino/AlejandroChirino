import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")
    const category = searchParams.get("category")
    const subcategoria = searchParams.get("subcategoria")
    const is_vip = searchParams.get("is_vip")
    const is_new = searchParams.get("is_new")
    const featured = searchParams.get("featured")
    const on_sale = searchParams.get("on_sale")
    const archivedParam = searchParams.get("archived")
    const noImageParam = searchParams.get("no_image")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let db: any
    try {
      db = await getAdminDb(request)
    } catch (e) {
      return NextResponse.json({ error: "No autorizado o cliente admin no disponible" }, { status: 401 })
    }

    let query = db.from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Aplicar filtros
    if (search) {
      // Use RPC-backed trigram search for better relevance and typo tolerance.
      // We'll call the RPC below and skip adding ilike to the main query.
    }
    if (category && category !== "all") {
      query = query.eq("category", category)
    }
    if (subcategoria && subcategoria !== "all") {
      query = query.eq("subcategoria", subcategoria)
    }
    if (is_vip !== null) {
      query = query.eq("is_vip", is_vip === "true")
    }
    if (is_new !== null) {
      query = query.eq("is_new", is_new === "true")
    }
    if (featured !== null) {
      query = query.eq("featured", featured === "true")
    }
    if (on_sale !== null) {
      query = query.eq("on_sale", on_sale === "true")
    }
    // Filter products without images (either image_url is null OR image_urls is empty array)
    if (noImageParam === "true") {
      // Use OR to match either a NULL single image or an empty array stored as '{}'
      try {
        query = query.or("image_url.is.null,image_urls.eq.{}")
      } catch (e) {
        // Fallback: if the above fails for some reason, try filtering only by image_url NULL
        query = query.is("image_url", null)
      }
    }
    // Admin filter for archived: explicit values only (true/false). If not provided, return all.
    if (archivedParam !== null) {
      if (archivedParam === "true" || archivedParam === "false") {
        query = query.eq("archived", archivedParam === "true")
      }
    }

    // Paginación
    const from = (page - 1) * limit
    const to = from + limit - 1

    // If there's an active search term, prefer the RPC (pg_trgm) for relevance.
    if (search) {
      try {
        // To support pagination with the existing RPC (which accepts limit_count but
        // not offset), request enough rows (from + limit) and slice server-side.
        const rpcLimit = Math.max(50, from + limit)
        const rpcParams: any = {
          q: search,
          category_filter: category === "all" ? null : category,
          min_price: null,
          max_price: null,
          limit_count: rpcLimit,
        }

        const { data: rpcProducts, error: rpcError } = await db.rpc("search_products_rpc", rpcParams)

        if (rpcError) {
          console.warn("RPC search_products_rpc failed in admin/products, falling back:", rpcError)
          // fall back to previous ilike behavior below
        } else {
          const products = Array.isArray(rpcProducts) ? rpcProducts.slice(from, from + limit) : []

          // For pagination total, run a count using ilike as a fallback method.
          // Note: this count may differ slightly from exact trigram matches, but is sufficient for pages.
          let countQuery = db.from("products").select("id", { count: "exact" })
          countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
          if (category && category !== "all") countQuery = countQuery.eq("category", category)
          const { count } = (await countQuery) as any

          return NextResponse.json({
            products,
            pagination: {
              page,
              limit,
              total: count || 0,
              totalPages: Math.ceil((count || 0) / limit),
            },
          })
        }
      } catch (err) {
        console.error("Error using RPC in admin/products:", err)
        // fall through to ilike fallback
      }
    }

    // If no search or RPC failed, use the legacy query behavior (ilike + filters + pagination)
    if (search) {
      query = query.ilike("name", `%${search}%`)
    }

    // Apply category/subcategoria/flags already set earlier
    query = query.range(from, to)

    let products: any = null
    let error: any = null
    let count: any = 0

    try {
      const res: any = await query
      products = res.data ?? res
      error = res.error
      count = res.count ?? res?.count
    } catch (e: any) {
      console.error("Exception executing products query", {
        params: { search, category, subcategoria, is_vip, is_new, featured, on_sale, archivedParam, noImageParam, page, limit, from, to },
        error: e,
      })

      // Handle PostgREST range error (requested offset beyond available rows)
      // PostgREST surface codes under error.code === 'PGRST103' in some environments
      // and the message contains 'Requested range not satisfiable'. Return an empty
      // result set instead of propagating a 500 so the admin UI can handle empty pages.
      const errCode = e?.code || null
      const errMsg = typeof e?.message === "string" ? e.message : null
      if (errCode === "PGRST103" || (errMsg && errMsg.includes("Requested range not satisfiable"))) {
        return NextResponse.json({ products: [], pagination: { page, limit, total: 0, totalPages: 0 } })
      }

      return NextResponse.json({ error: "Error al ejecutar consulta de productos" }, { status: 500 })
    }

    if (error) {
      console.error("Error fetching products:", error, { params: { search, category, subcategoria, is_vip, is_new, featured, on_sale, archivedParam, noImageParam, page, limit, from, to } })

      const pgErrCode = error?.code || null
      const pgErrMsg = typeof error?.message === "string" ? error.message : null
      if (pgErrCode === "PGRST103" || (pgErrMsg && pgErrMsg.includes("Requested range not satisfiable"))) {
        return NextResponse.json({ products: [], pagination: { page, limit, total: 0, totalPages: 0 } })
      }

      return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    console.error("Error in GET /api/admin/productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    let db: any
    try {
      db = await getAdminDb(request)
    } catch (e) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
    }
    const body = await request.json()

    // --- LÓGICA DE CÁLCULO DE INVERSIÓN ELIMINADA ---
    // La base de datos (Trigger) ahora es la única responsable de calcular 'inversion_cup'.
    // Esto resuelve el conflicto de doble cálculo.

    // Construir payload tipado para la tabla products (Insert)
    type ProductsInsert = import("@/lib/database.types").Database["public"]["Tables"]["products"]["Insert"]
    const now = new Date().toISOString()
    const productData: ProductsInsert = {
      id: body.id,
      name: body.name,
      description: body.description ?? null,
      // Usamos ?? null para asegurar que los campos numéricos opcionales acepten null
      price: body.price ?? null, 
      sale_price: body.sale_price ?? null,
      on_sale: body.on_sale ?? null,
      // Prefer image_urls array when provided; keep image_url for backward compatibility
      image_urls: body.image_urls ?? (body.image_url ? [body.image_url] : []),
      image_url: (body.image_urls && body.image_urls.length > 0) ? body.image_urls[0] : body.image_url ?? null,
      category: body.category,
      subcategoria: body.subcategoria ?? null,
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      stock: body.stock ?? 0,
      featured: body.featured ?? false,
      is_vip: body.is_vip ?? null,
      is_new: body.is_new ?? true,

      // Enviamos los valores de origen para que el TRIGGER DE LA DB los lea.
      peso: body.peso ?? null, 
      precio_compra: body.precio_compra ?? null,

      // Enviamos NULL, permitiendo que el TRIGGER lo sobrescriba con el valor calculado.
      inversion_cup: null, 
      colaboracion_id: body.colaboracion_id ?? null,
      created_at: now,
      updated_at: now,
    }

    const { data: product, error } = await db
      .from("products")
      .insert([productData as never])
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ error: "Error al crear producto" }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error in POST /api/admin/productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    // Normalize ids: split, trim, remove surrounding angle brackets if present (clients sometimes send <id>)
    const rawIds = searchParams.get("ids") || ""
    const ids = rawIds
      .split(",")
      .map((s) => String(s || "").trim())
      .map((s) => s.replace(/^<|>$/g, ""))
      .filter(Boolean)
    const force = (searchParams.get("force") || "false") === "true"

    if (ids.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron IDs válidos" }, { status: 400 })
    }

    // Validate UUID format for all ids and report invalid ones
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const invalidIds = ids.filter((id) => !uuidRegex.test(id))
    if (invalidIds.length > 0) {
      return NextResponse.json({ error: "IDs inválidos", invalid: invalidIds }, { status: 400 })
    }

  let db: any
  try {
    db = await getAdminDb(request)
  } catch (e) {
    return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
  }

  // If force flag is set, snapshot product info into order_items.product_snapshot
  // and allow product deletion while preserving order_items data.
  if (force) {
    try {
      // Fetch product data for snapshot (limit fields to relevant ones)
      const { data: productsToSnapshot, error: prodFetchErr } = await db.from("products").select("id, name, price, image_url, category, subcategoria").in("id", ids)
      if (prodFetchErr) {
        console.error("Error fetching products for snapshot:", prodFetchErr, { ids })
        return NextResponse.json({ error: prodFetchErr?.message || "Error preparando snapshot de productos", details: prodFetchErr }, { status: 500 })
      }

      // For each product, write a snapshot into order_items.product_snapshot
      const updates: Array<Promise<any>> = []
      for (const p of (productsToSnapshot || []) as any[]) {
        const snapshot = {
          id: p.id,
          name: p.name,
          price: p.price,
          image_url: p.image_url ?? null,
          category: p.category ?? null,
          subcategoria: p.subcategoria ?? null,
        }
        updates.push(db.from("order_items").update({ product_snapshot: snapshot }).eq("product_id", p.id))
      }

      const results = await Promise.all(updates)
      const anyErr = results.find((r) => r.error)
      if (anyErr) {
        console.error("Error updating order_items with product snapshot:", anyErr.error)
        return NextResponse.json({ error: anyErr.error?.message || "Error actualizando order_items con snapshot", details: anyErr.error }, { status: 500 })
      }

      console.log(`Snapshot applied to order_items for ${Array.isArray(productsToSnapshot) ? productsToSnapshot.length : 0} products`, { ids })
    } catch (e) {
      console.error("Unexpected error snapshotting order_items:", e, { ids })
      return NextResponse.json({ error: "Error aplicando snapshot a referencias de pedidos" }, { status: 500 })
    }
  }

  const { error } = await db.from("products").delete().in("id", ids)

  if (error) {
    console.error("Error deleting products:", error, { ids })

    // Detect common Postgres foreign key violation (23503) and return 409 Conflict
    const pgCode = error?.code || error?.details || null
    const message = error?.message || JSON.stringify(error)
    if (pgCode === "23503" || (typeof message === "string" && message.includes("violates foreign key constraint"))) {
      return NextResponse.json({ error: "No se puede eliminar el/los producto(s): están referenciados por pedidos (order_items)." }, { status: 409 })
    }

    // En desarrollo, devolver mensaje de error más detallado para depuración.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.json({ error: error?.message || error || "Error al eliminar productos", details: error }, { status: 500 })
    }

    return NextResponse.json({ error: "Error al eliminar productos" }, { status: 500 })
  }

  return NextResponse.json({ message: `${ids.length} productos eliminados correctamente` })
  } catch (error) {
    console.error("Error in DELETE /api/admin/productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    let db: any
    try {
      db = await getAdminDb(request)
    } catch (e) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
    }
    const body = await request.json()
    const ids: string[] = body.ids || []
    const changes = body.changes || {}

    // Debug: if precio_compra is present, log to help trace unexpected mutations
    try {
      if (changes && Object.prototype.hasOwnProperty.call(changes, 'precio_compra')) {
        console.log('[admin/products PATCH] received precio_compra in changes:', changes.precio_compra, 'ids:', body.ids)
      }
    } catch (e) {
      console.warn('Error logging precio_compra debug info', e)
    }

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron IDs" }, { status: 400 })
    }

    // Build update payload only with keys that are not null/undefined
    const updatePayload: Record<string, any> = {}
    const acceptIfPresent = (key: string) => {
      if (changes[key] !== undefined && changes[key] !== null) updatePayload[key] = changes[key]
    }

    // Common flags
    acceptIfPresent("featured")
    acceptIfPresent("is_vip")
    acceptIfPresent("is_new")
    acceptIfPresent("archived")

    // Texto / meta
    acceptIfPresent("name")
    acceptIfPresent("description")

    // Price fields
    acceptIfPresent("price")
    acceptIfPresent("sale_price")
    acceptIfPresent("on_sale")

    // Media / category
    acceptIfPresent("image_url")
    acceptIfPresent("image_urls")
    acceptIfPresent("category")
    acceptIfPresent("subcategoria")

    // Inventory and attributes
    acceptIfPresent("sizes")
    acceptIfPresent("colors")
    acceptIfPresent("stock")
    // Additional product fields
    acceptIfPresent("brand")
    acceptIfPresent("tags")
    acceptIfPresent("peso")
    acceptIfPresent("precio_compra")

    if (Object.keys(updatePayload).length === 0) {
      // It's possible sale_action is present; defer to sale_action handling
      if (!changes.sale_action) {
        return NextResponse.json({ error: "No hay cambios válidos para aplicar" }, { status: 400 })
      }
    }

    // Apply the simple field updates if present
    if (Object.keys(updatePayload).length > 0) {
      let adminClient: any
      try {
        adminClient = await getAdminDb()
      } catch (e) {
        return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
      }

      // For array fields ensure proper format (PostgREST expects arrays serialized)
      const formattedPayload = { ...updatePayload }
      if (Array.isArray(formattedPayload.sizes)) formattedPayload.sizes = formattedPayload.sizes
      if (Array.isArray(formattedPayload.colors)) formattedPayload.colors = formattedPayload.colors
      if (Array.isArray(formattedPayload.tags)) formattedPayload.tags = formattedPayload.tags

      // Debug: log payload before DB update to confirm the value we write
      try { console.log('[admin/products PATCH] updating products with payload:', formattedPayload, 'ids:', ids) } catch (e) { /* ignore */ }
      const { error } = await adminClient.from("products").update(formattedPayload).in("id", ids)

      if (error) {
        console.error("Error updating products:", error)
        return NextResponse.json({ error: "Error al actualizar productos" }, { status: 500 })
      }
    }

    // Handle sale_action if present
    if (changes.sale_action) {
      const saleAction = changes.sale_action

      if (saleAction.action === "remove") {
        let adminClient: any
        try {
          adminClient = await getAdminDb()
        } catch (e) {
          return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
        }
        const { error } = await adminClient.from("products").update({ on_sale: false, sale_price: null }).in("id", ids)
        if (error) {
          console.error("Error removing sale:", error)
          return NextResponse.json({ error: "Error al quitar ofertas" }, { status: 500 })
        }
        return NextResponse.json({ message: `Ofertas removidas para ${ids.length} productos` })
      }

      if (saleAction.action === "apply") {
        // Fetch products to read price
          const { data: products, error: fetchError } = await db.from("products").select("id, price").in("id", ids)
        if (fetchError) {
          console.error("Error fetching products for sale:", fetchError)
          return NextResponse.json({ error: "Error al preparar ofertas" }, { status: 500 })
        }

        const updates: Array<Promise<any>> = []
        for (const p of products as any[]) {
          const price = Number(p.price)
          if (isNaN(price) || price <= 0) continue

          let sale_price = price
          if (saleAction.mode === "percent") {
            const pct = Number(saleAction.value)
            sale_price = +(price * (1 - pct / 100))
          } else if (saleAction.mode === "amount") {
            const amt = Number(saleAction.value)
            sale_price = +(price - amt)
          }

          // Ensure non-negative and round to 2 decimals
          sale_price = Math.max(0, Math.round(sale_price * 100) / 100)

          updates.push(db.from("products").update({ on_sale: true, sale_price }).eq("id", p.id))
        }

        const results = await Promise.all(updates)
        const anyError = results.find((r) => r.error)
        if (anyError) {
          console.error("Error applying sale updates:", anyError.error)
          return NextResponse.json({ error: "Error al aplicar ofertas" }, { status: 500 })
        }

        return NextResponse.json({ message: `Ofertas aplicadas a ${updates.length} productos` })
      }
    }

    return NextResponse.json({ message: `Actualizados ${ids.length} productos` })
  } catch (error) {
    console.error("Error in PATCH /api/admin/productos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
