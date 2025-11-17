import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const category = (searchParams.get("category") || "all").trim()
    const minPrice = searchParams.get("minPrice")
    const maxPrice = searchParams.get("maxPrice")
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10)

    if (!q) return NextResponse.json([], { status: 200 })

    // Try RPC first (requires that you create the search_products_rpc function in your DB)
    try {
      const rpcParams: any = {
        q,
        category_filter: category === "all" ? null : category,
        min_price: minPrice ? Number.parseFloat(minPrice) : null,
        max_price: maxPrice ? Number.parseFloat(maxPrice) : null,
        limit_count: Number.isFinite(limit) ? limit : 50,
      }

      const { data: products, error } = await supabase.rpc("search_products_rpc", rpcParams)

      if (error) {
        console.warn("RPC search_products_rpc error, falling back:", error)
        throw error
      }

      return NextResponse.json(products || [])
    } catch (rpcErr) {
      // If RPC fails (not created yet, permission issue, etc.), fallback to ilike + JS scoring
      console.warn("search_products_rpc failed, falling back to ilike + JS scoring:", rpcErr)

      let supabaseQuery = supabase
        .from("products")
        .select(
          "id, name, description, price, sale_price, on_sale, image_url, category, subcategoria, sizes, colors, stock, created_at"
        )

      supabaseQuery = supabaseQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%`)

      if (category && category !== "all") {
        supabaseQuery = supabaseQuery.eq("category", category)
      }

      if (minPrice) {
        const n = Number.parseFloat(minPrice)
        if (!Number.isNaN(n)) supabaseQuery = supabaseQuery.gte("price", n)
      }

      if (maxPrice) {
        const n = Number.parseFloat(maxPrice)
        if (!Number.isNaN(n)) supabaseQuery = supabaseQuery.lte("price", n)
      }

      supabaseQuery = supabaseQuery.limit(Number.isFinite(limit) ? limit : 50).order("created_at", { ascending: false })

      const { data: products, error } = await supabaseQuery

      if (error) {
        console.error("Search API error:", error)
        return NextResponse.json({ error: error.message || "Error searching products" }, { status: 500 })
      }

      try {
        const ql = q.toLowerCase()
        const scored = (products || []).map((p: any) => {
          const name = String(p?.name ?? "").toLowerCase()
          const desc = String(p?.description ?? "").toLowerCase()
          let score = 0

          if (!ql) score = 0
          else {
            if (name === ql) score += 100
            else if (name.startsWith(ql)) score += 80
            else if (name.includes(ql)) score += 50

            if (desc.includes(ql)) score += 20
          }

          if (p?.on_sale) score += 5
          score += Math.max(0, 10 - (name.length / 10))

          return { ...p, _score: score }
        })

        scored.sort((a: any, b: any) => {
          if ((b._score ?? 0) !== (a._score ?? 0)) return (b._score ?? 0) - (a._score ?? 0)
          const ta = a.created_at ? Date.parse(a.created_at) : 0
          const tb = b.created_at ? Date.parse(b.created_at) : 0
          return tb - ta
        })

        return NextResponse.json(scored || [])
      } catch (err) {
        console.error("Search scoring error:", err)
        return NextResponse.json(products || [])
      }
    }
  } catch (err) {
    console.error("Search route error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
