import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

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
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "20")

    let query = getSupabaseAdmin()
      .from("products")
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

        const { data: rpcProducts, error: rpcError } = await getSupabaseAdmin().rpc("search_products_rpc", rpcParams)

        if (rpcError) {
          console.warn("RPC search_products_rpc failed in admin/products, falling back:", rpcError)
          // fall back to previous ilike behavior below
        } else {
          const products = Array.isArray(rpcProducts) ? rpcProducts.slice(from, from + limit) : []

          // For pagination total, run a count using ilike as a fallback method.
          // Note: this count may differ slightly from exact trigram matches, but is sufficient for pages.
          let countQuery = getSupabaseAdmin().from("products").select("id", { count: "exact" })
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

    const { data: products, error, count } = await query

    if (error) {
      console.error("Error fetching products:", error)
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
      is_new: body.is_new ?? null,

      // Enviamos los valores de origen para que el TRIGGER DE LA DB los lea.
      peso: body.peso ?? null, 
      precio_compra: body.precio_compra ?? null,

      // Enviamos NULL, permitiendo que el TRIGGER lo sobrescriba con el valor calculado.
      inversion_cup: null, 
      colaboracion_id: body.colaboracion_id ?? null,
      created_at: now,
      updated_at: now,
    }

    const { data: product, error } = await getSupabaseAdmin()
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
    const ids = searchParams.get("ids")?.split(",") || []

    if (ids.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron IDs" }, { status: 400 })
    }

  const { error } = await getSupabaseAdmin().from("products").delete().in("id", ids)

    if (error) {
      console.error("Error deleting products:", error)
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
    const body = await request.json()
    const ids: string[] = body.ids || []
    const changes = body.changes || {}

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: "No se proporcionaron IDs" }, { status: 400 })
    }

    // Build update payload only with keys that are not null/undefined
    const updatePayload: Record<string, any> = {}
    if (changes.featured !== undefined && changes.featured !== null) updatePayload.featured = changes.featured
    if (changes.is_vip !== undefined && changes.is_vip !== null) updatePayload.is_vip = changes.is_vip
    if (changes.is_new !== undefined && changes.is_new !== null) updatePayload.is_new = changes.is_new

    if (Object.keys(updatePayload).length === 0) {
      // It's possible sale_action is present; defer to sale_action handling
      if (!changes.sale_action) {
        return NextResponse.json({ error: "No hay cambios válidos para aplicar" }, { status: 400 })
      }
    }

    // Apply the simple field updates if present
    if (Object.keys(updatePayload).length > 0) {
      const { error } = await getSupabaseAdmin().from("products").update(updatePayload).in("id", ids)

      if (error) {
        console.error("Error updating products:", error)
        return NextResponse.json({ error: "Error al actualizar productos" }, { status: 500 })
      }
    }

    // Handle sale_action if present
    if (changes.sale_action) {
      const saleAction = changes.sale_action

      if (saleAction.action === "remove") {
        const { error } = await getSupabaseAdmin().from("products").update({ on_sale: false, sale_price: null }).in("id", ids)
        if (error) {
          console.error("Error removing sale:", error)
          return NextResponse.json({ error: "Error al quitar ofertas" }, { status: 500 })
        }
        return NextResponse.json({ message: `Ofertas removidas para ${ids.length} productos` })
      }

      if (saleAction.action === "apply") {
        // Fetch products to read price
        const { data: products, error: fetchError } = await getSupabaseAdmin().from("products").select("id, price").in("id", ids)
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

          updates.push(getSupabaseAdmin().from("products").update({ on_sale: true, sale_price }).eq("id", p.id))
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
