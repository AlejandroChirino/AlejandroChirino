import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const category = searchParams.get("category")
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const limit = searchParams.get("limit") || "20"

    if (!query) {
      return NextResponse.json({ error: "Search query is required" }, { status: 400 })
    }

    let supabaseQuery = supabase.from("products").select("*").or(`name.ilike.%${query}%,description.ilike.%${query}%`)

    // Filtros adicionales
    if (category && category !== "all") {
      supabaseQuery = supabaseQuery.eq("category", category)
    }

    if (minPrice) {
      supabaseQuery = supabaseQuery.gte("price", Number.parseFloat(minPrice))
    }

    if (maxPrice) {
      supabaseQuery = supabaseQuery.lte("price", Number.parseFloat(maxPrice))
    }

    supabaseQuery = supabaseQuery.limit(Number.parseInt(limit)).order("created_at", { ascending: false })

    const { data: products, error } = await supabaseQuery

    if (error) {
      return NextResponse.json({ error: "Error searching products" }, { status: 500 })
    }

    return NextResponse.json(products)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
