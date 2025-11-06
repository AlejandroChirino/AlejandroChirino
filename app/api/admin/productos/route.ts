import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

// Sanitiza y tipa parámetros de consulta
function parseQueryParams(searchParams: URLSearchParams) {
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "20")
  const search = searchParams.get("search")?.trim() || null
  const category = searchParams.get("category") || null
  const subcategoria = searchParams.get("subcategoria") || null
  const is_vip = searchParams.get("is_vip")
  const is_new = searchParams.get("is_new")
  const featured = searchParams.get("featured")
  const on_sale = searchParams.get("on_sale")

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    limit: Number.isFinite(limit) && limit > 0 && limit <= 100 ? limit : 20,
    search,
    category: category && category !== "all" ? category : null,
    subcategoria: subcategoria && subcategoria !== "all" ? subcategoria : null,
    is_vip: is_vip === null ? null : is_vip === "true",
    is_new: is_new === null ? null : is_new === "true",
    featured: featured === null ? null : featured === "true",
    on_sale: on_sale === null ? null : on_sale === "true",
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, search, category, subcategoria, is_vip, is_new, featured, on_sale } =
      parseQueryParams(searchParams)

    // Seleccionar todas las columnas para evitar fallos si el esquema no coincide exactamente
    // y pedir count exacto para la paginación
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

    // Aplicar filtros
    if (search) {
      // Buscar en nombre o descripción
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (category) {
      query = query.eq("category", category)
    }
    if (subcategoria) {
      query = query.eq("subcategoria", subcategoria)
    }
    if (is_vip !== null) {
      query = query.eq("is_vip", is_vip)
    }
    if (is_new !== null) {
      query = query.eq("is_new", is_new)
    }
    if (featured !== null) {
      query = query.eq("featured", featured)
    }
    if (on_sale !== null) {
      query = query.eq("on_sale", on_sale)
    }

    // Paginación
    const from = (page - 1) * limit
    const to = from + limit - 1
    query = query.range(from, to)

  const { data: products, error, count } = await query

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
    }

    return NextResponse.json({
      products: products ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.max(1, Math.ceil((count ?? 0) / limit)),
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

    // Obtener configuración para calcular inversión
    type ConfigRow = Database["public"]["Tables"]["configuracion"]["Row"]
    const { data: config } = await supabase.from("configuracion").select("*").single()

    if (!config) {
      return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
    }

    // Calcular inversión en CUP
    const { precio_libra, valor_dolar } = config as ConfigRow
    const inversion_cup = (body.peso * precio_libra + body.precio_compra) * valor_dolar

    const productData = {
      ...body,
      inversion_cup,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    type ProductInsert = Database["public"]["Tables"]["products"]["Insert"]
    const { data: product, error } = await (supabase as any)
      .from("products")
      .insert([productData as ProductInsert])
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

    const { error } = await supabase.from("products").delete().in("id", ids)

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
