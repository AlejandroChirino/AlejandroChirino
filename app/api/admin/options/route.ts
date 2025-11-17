import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const subcategoria = searchParams.get("subcategoria")
    const subcategoria_like = searchParams.get("subcategoria_like")
    const on_sale = searchParams.get("on_sale")
    const featured = searchParams.get("featured")
    const is_vip = searchParams.get("is_vip")
    const is_new = searchParams.get("is_new")
    const createdAfter = searchParams.get("createdAfter")

    let query = getSupabaseAdmin().from("products").select("colors,sizes")

    if (category && category !== "all") {
      query = query.eq("category", category)
    }
    if (subcategoria && subcategoria !== "all") {
      query = query.eq("subcategoria", subcategoria)
    }
    if (subcategoria_like) {
      query = query.ilike("subcategoria", `%${subcategoria_like}%`)
    }
    if (on_sale !== null) {
      query = query.eq("on_sale", on_sale === "true")
    }
    if (featured !== null) {
      query = query.eq("featured", featured === "true")
    }
    if (is_vip !== null) {
      query = query.eq("is_vip", is_vip === "true")
    }
    if (is_new !== null) {
      query = query.eq("is_new", is_new === "true")
    }
    if (createdAfter) {
      // allow callers to request options for products created after a given ISO date
      query = query.gte("created_at", createdAfter)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching product options:", error)
      return NextResponse.json({ error: "Error al obtener opciones" }, { status: 500 })
    }

    const colorsSet = new Set<string>()
    const sizesSet = new Set<string>()

    ;(data || []).forEach((row: any) => {
      if (Array.isArray(row.colors)) {
        row.colors.forEach((c: any) => {
          if (c !== null && c !== undefined && String(c).trim() !== "") colorsSet.add(String(c))
        })
      }
      if (Array.isArray(row.sizes)) {
        row.sizes.forEach((s: any) => {
          if (s !== null && s !== undefined && String(s).trim() !== "") sizesSet.add(String(s))
        })
      }
    })

    const colors = Array.from(colorsSet).sort()
    const sizes = Array.from(sizesSet).sort()

    return NextResponse.json(
      { colors, sizes },
      { headers: { "Cache-Control": "public, max-age=60" } }
    )
  } catch (error) {
    console.error("Error in GET /api/admin/options:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
