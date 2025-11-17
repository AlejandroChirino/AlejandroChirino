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
    // parse base params
    const { category, subcategoria, featured, onSale, limit, search } = validateQueryParams(searchParams)
    const colors = searchParams.getAll("colors") || []
    const sizes = searchParams.getAll("sizes") || []
    const is_vip = searchParams.get("is_vip") === "true"
    const is_new = searchParams.get("is_new") === "true"
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortByParam = searchParams.get("sortBy")
    const sortBy = sortByParam || null
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const offset = searchParams.get("offset")
    const includeTotal = searchParams.get("includeTotal") === "true"
    const createdAfter = searchParams.get("createdAfter")

    // Query the view that exposes effective_price (must be created in the DB)
    let query = supabase.from("products_with_effective_price")
      .select(
        "id, name, description, price, sale_price, on_sale, image_url, category, subcategoria, sizes, colors, stock, featured, is_vip, is_new, created_at, updated_at, effective_price, weekly_hash",
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

    if (is_vip) {
      query = query.eq("is_vip", true)
    }

    if (is_new) {
      query = query.eq("is_new", true)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // Apply array filters (PostgREST supports overlaps/contains via supabase-js)
    if (colors && colors.length > 0) {
      query = query.overlaps("colors", colors)
    }

    if (sizes && sizes.length > 0) {
      query = query.overlaps("sizes", sizes)
    }

    // Filter by createdAfter if provided
    if (createdAfter) {
      query = query.gte("created_at", createdAfter)
    }

    // Apply effective-price min/max using the view column
    if (minPrice) query = query.gte("effective_price", Number.parseFloat(minPrice))
    if (maxPrice) query = query.lte("effective_price", Number.parseFloat(maxPrice))

    // If requested, compute total count before applying range/limit
    let total: number | undefined = undefined
    if (includeTotal) {
      let countQuery = supabase.from("products_with_effective_price").select("id", { head: true, count: "exact" })
      if (category && category !== "all") countQuery = countQuery.eq("category", category)
      if (subcategoria) countQuery = countQuery.eq("subcategoria", subcategoria)
      if (featured) countQuery = countQuery.eq("featured", true)
      if (onSale) countQuery = countQuery.eq("on_sale", true)
      if (is_vip) countQuery = countQuery.eq("is_vip", true)
      if (is_new) countQuery = countQuery.eq("is_new", true)
      if (search) countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
      if (colors && colors.length > 0) countQuery = countQuery.overlaps("colors", colors)
      if (sizes && sizes.length > 0) countQuery = countQuery.overlaps("sizes", sizes)
      if (createdAfter) countQuery = countQuery.gte("created_at", createdAfter)
      if (minPrice) countQuery = countQuery.gte("effective_price", Number.parseFloat(minPrice))
      if (maxPrice) countQuery = countQuery.lte("effective_price", Number.parseFloat(maxPrice))

      const countRes = await countQuery
      if (countRes.error) {
        return NextResponse.json({ error: "Error al obtener el total de productos" }, { status: 500 })
      }
      total = countRes.count ?? 0
    }

    // Apply sorting server-side
    const asc = sortOrder === "asc"
    if (!sortBy) {
      // default: deterministic weekly-random order using weekly_hash
      query = query.order("weekly_hash", { ascending: asc })
    } else if (sortBy === "price") {
      query = query.order("effective_price", { ascending: asc })
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: asc })
    } else {
      query = query.order("created_at", { ascending: asc })
    }

    // Apply offset/limit using range (if limit specified)
    const off = offset ? Math.max(Number.parseInt(offset), 0) : 0
    if (limit) {
      const start = off
      const end = off + Number.parseInt(String(limit)) - 1
      query = query.range(start, end)
    } else if (off) {
      query = query.range(off, 999999)
    }

    const { data: products, error } = await query

    if (error) {
      return NextResponse.json({ error: "Error al obtener productos" }, { status: 500 })
    }

    const list = products || []
    const cacheHeaders = { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60" }
    if (includeTotal) {
      return NextResponse.json({ products: list, total: total ?? list.length }, { headers: cacheHeaders })
    }

    return NextResponse.json(list, { headers: cacheHeaders })
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
