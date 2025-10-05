import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { ProductCategory } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as ProductCategory | "all" | null
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const limit = searchParams.get("limit")

    let query = supabase.from("products").select("*").eq("vip", true) // Solo productos VIP

    // Aplicar filtros
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (minPrice) {
      query = query.gte("price", Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      query = query.lte("price", Number.parseFloat(maxPrice))
    }

    // Aplicar ordenamiento
    const ascending = sortOrder === "asc"
    if (sortBy === "price") {
      query = query.order("price", { ascending })
    } else if (sortBy === "name") {
      query = query.order("name", { ascending })
    } else {
      query = query.order("created_at", { ascending })
    }

    // Aplicar límite si se especifica
    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: products, error } = await query

    if (error) {
      console.error("Error fetching VIP products:", error)
      return NextResponse.json({ error: "Error al obtener productos VIP" }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
