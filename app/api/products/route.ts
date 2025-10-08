import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { ProductCategory } from "@/lib/types"

// Validar parámetros de consulta
function validateQueryParams(searchParams: URLSearchParams) {
  const category = searchParams.get("category") as ProductCategory | "all" | null
  const subcategoria = searchParams.get("subcategoria")
  const featured = searchParams.get("featured")
  const onSale = searchParams.get("on_sale")
  const limit = searchParams.get("limit")
  const search = searchParams.get("search")

  return {
    category: category && ["hombre", "mujer", "unisex", "accesorios", "all"].includes(category) ? category : null,
    subcategoria: subcategoria && subcategoria !== "all" ? subcategoria : null,
    featured: featured === "true",
    onSale: onSale === "true",
    limit: limit ? Math.min(Math.max(Number.parseInt(limit), 1), 100) : null,
    search: search?.trim() || null,
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { category, subcategoria, featured, onSale, limit, search } = validateQueryParams(searchParams)

    let query = supabase
      .from("products")
      .select(
        "id, name, description, price, sale_price, on_sale, image_url, category, subcategoria, sizes, colors, stock, featured, created_at, updated_at",
      )

    // Aplicar filtros
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (subcategoria) {
      query = query.eq("subcategoria", subcategoria)
    }

    if (featured) {
      query = query.eq("featured", true)
    }

    if (onSale) {
      query = query.eq("on_sale", true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Aplicar límite
    if (limit) {
      query = query.limit(limit)
    }

    // Ordenar por fecha de creación
    query = query.order("created_at", { ascending: false })

    const { data: products, error } = await query

    if (error) {
      return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: product, error } = await supabase.from("products").insert([body]).select().single()

    if (error) {
      return NextResponse.json({ error: "Error creating product" }, { status: 500 })
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
