import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { ProductCategory } from "@/lib/types"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category") as ProductCategory | "all" | null
    const featured = searchParams.get("featured")
    const limit = searchParams.get("limit")

    let query = supabase.from("articulos_en_camino").select("*")

    // Aplicar filtros
    if (category && category !== "all") {
      query = query.eq("category", category)
    }

    if (featured === "true") {
      query = query.eq("featured", true)
    }

    // Ordenar por fecha de llegada estimada
    query = query.order("estimated_arrival", { ascending: true })

    // Aplicar límite si se especifica
    if (limit) {
      query = query.limit(Number.parseInt(limit))
    }

    const { data: articulos, error } = await query

    if (error) {
      console.error("Error fetching articulos en camino:", error)
      return NextResponse.json({ error: "Error al obtener artículos en camino" }, { status: 500 })
    }

    return NextResponse.json(articulos || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
