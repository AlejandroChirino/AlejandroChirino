import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { ProductCategory } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as ProductCategory | "all" | null
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortByParam = searchParams.get("sortBy")
    const sortBy = sortByParam || null
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = searchParams.get("limit")
    const includeTotal = searchParams.get("includeTotal") === "true"

    // Query the view with effective_price
    let query = supabase.from("products_with_effective_price").select(
      "id, name, price, sale_price, on_sale, image_url, category, subcategoria, sizes, colors, created_at, effective_price, weekly_hash",
    ).eq("is_vip", true)

    // Aplicar filtros
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (minPrice) {
      query = query.gte("effective_price", Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte("effective_price", Number.parseFloat(maxPrice))
    }

    // If includeTotal requested, compute exact count first
    let total: number | undefined = undefined
    if (includeTotal) {
      let countQuery = supabase.from("products_with_effective_price").select("id", { head: true, count: "exact" }).eq("is_vip", true)
      if (category && category !== "all") countQuery = countQuery.eq("category", category)
      if (minPrice) countQuery = countQuery.gte("effective_price", Number.parseFloat(minPrice))
      if (maxPrice) countQuery = countQuery.lte("effective_price", Number.parseFloat(maxPrice))
      const cRes = await countQuery
      if (cRes.error) {
        console.error("Error counting VIP products:", cRes.error)
        return NextResponse.json({ error: "Error al obtener total VIP" }, { status: 500 })
      }
      total = cRes.count ?? 0
    }

    // Apply sorting server-side
    const asc = sortOrder === "asc"
    if (!sortBy) {
      query = query.order("weekly_hash", { ascending: asc })
    } else if (sortBy === "price") {
      query = query.order("effective_price", { ascending: asc })
    } else if (sortBy === "name") {
      query = query.order("name", { ascending: asc })
    } else {
      query = query.order("created_at", { ascending: asc })
    }

    // Apply limit if provided
    if (limit) query = query.limit(Number.parseInt(limit))

    const { data: products, error } = await query

    if (error) {
      console.error("Error fetching VIP products:", error)
      return NextResponse.json({ error: "Error al obtener productos VIP" }, { status: 500 })
    }

    const cacheHeaders = { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=60" }
    if (includeTotal) return NextResponse.json({ products: products || [], total: total ?? (products || []).length }, { headers: cacheHeaders })
    return NextResponse.json(products || [], { headers: cacheHeaders })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
