import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

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

    let query = supabaseAdmin
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })

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

    // --- LÓGICA DE CÁLCULO DE INVERSIÓN ELIMINADA ---
    // La base de datos (Trigger) ahora es la única responsable de calcular 'inversion_cup'.
    // Esto resuelve el conflicto de doble cálculo.

    // Construir payload tipado para la tabla products (Insert)
    type ProductsInsert = import("@/lib/database.types").Database["public"]["Tables"]["products"]["Insert"]
    const now = new Date().toISOString()
    const productData: ProductsInsert = {
      id: body.id,
      name: body.name,
      description: body.description ?? null,
      // Usamos ?? null para asegurar que los campos numéricos opcionales acepten null
      price: body.price ?? null, 
      sale_price: body.sale_price ?? null,
      on_sale: body.on_sale ?? null,
      image_url: body.image_url ?? null,
      category: body.category,
      subcategoria: body.subcategoria ?? null,
      sizes: body.sizes ?? [],
      colors: body.colors ?? [],
      stock: body.stock ?? 0,
      featured: body.featured ?? false,
      is_vip: body.is_vip ?? null,
      is_new: body.is_new ?? null,

      // Enviamos los valores de origen para que el TRIGGER DE LA DB los lea.
      peso: body.peso ?? null, 
      precio_compra: body.precio_compra ?? null,

      // Enviamos NULL, permitiendo que el TRIGGER lo sobrescriba con el valor calculado.
      inversion_cup: null, 
      colaboracion_id: body.colaboracion_id ?? null,
      created_at: now,
      updated_at: now,
    }

    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert([productData as never])
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

    const { error } = await supabaseAdmin.from("products").delete().in("id", ids)

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
