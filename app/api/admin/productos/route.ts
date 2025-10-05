import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

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

    let query = supabase.from("products").select("*").order("created_at", { ascending: false })

    // Aplicar filtros
    if (search) {
      query = query.ilike("name", `%${search}%`)
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

    // Obtener configuración para calcular inversión
    const { data: config } = await supabase.from("configuracion").select("precio_libra, valor_dolar").single()

    if (!config) {
      return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
    }

    // Calcular inversión en CUP
    const inversion_cup = (body.peso * config.precio_libra + body.precio_compra) * config.valor_dolar

    const productData = {
      ...body,
      inversion_cup,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data: product, error } = await supabase.from("products").insert([productData]).select().single()

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
