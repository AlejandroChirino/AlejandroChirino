import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { data: product, error } = await getSupabaseAdmin()
      .from("products")
      .select("*")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching product:", error)
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error in GET /api/admin/productos/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Obtener configuración para calcular inversión
    const respConfig = await getSupabaseAdmin()
      .from("configuracion")
      .select("precio_libra, valor_dolar")
      .single()
    const config = respConfig.data as { precio_libra: number; valor_dolar: number } | null

    if (!config) {
      return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
    }

    // Calcular inversión en CUP
    const inversion_cup = (body.peso * config.precio_libra + body.precio_compra) * config.valor_dolar

    type ProductsUpdate = import("@/lib/database.types").Database["public"]["Tables"]["products"]["Update"]
    const productData: ProductsUpdate = {
      name: body.name,
      description: body.description ?? null,
      price: body.price,
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
      inversion_cup,
      colaboracion_id: body.colaboracion_id ?? null,
      updated_at: new Date().toISOString(),
    }

    const { data: product, error } = await getSupabaseAdmin()
      .from("products")
      .update(productData as never)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ error: "Error al actualizar producto" }, { status: 500 })
    }

    return NextResponse.json({ product })
  } catch (error) {
    console.error("Error in PUT /api/admin/productos/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
  const { id } = await params
  const { error } = await getSupabaseAdmin().from("products").delete().eq("id", id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ error: "Error al eliminar producto" }, { status: 500 })
    }

    return NextResponse.json({ message: "Producto eliminado correctamente" })
  } catch (error) {
    console.error("Error in DELETE /api/admin/productos/[id]:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
