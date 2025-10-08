import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { data: product, error } = await supabase.from("products").select("*").eq("id", params.id).single()

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

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
      updated_at: new Date().toISOString(),
    }

    const { data: product, error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", params.id)
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

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { error } = await supabase.from("products").delete().eq("id", params.id)

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
