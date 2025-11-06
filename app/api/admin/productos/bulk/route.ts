import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { ProductFormData } from "@/lib/admin-types"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(request: Request) {
  const { productData, quantity }: { productData: ProductFormData; quantity: number } = await request.json()

  if (!productData || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  try {
    // Alinear el payload con el POST individual usando tipos de la DB
    type ProductsInsert = import("@/lib/database.types").Database["public"]["Tables"]["products"]["Insert"]
    const now = new Date().toISOString()

    const base: ProductsInsert = {
      // campos comunes del formulario
      id: undefined as unknown as string, // se asignará por cada item
      name: productData.name,
      description: productData.description ?? null,
      price: productData.price ?? null,
      sale_price: productData.sale_price ?? null,
      on_sale: productData.on_sale ?? null,
      image_url: productData.image_url || null,
  category: productData.category as ProductsInsert["category"],
      subcategoria: productData.subcategoria ?? null,
      sizes: productData.sizes ?? [],
      colors: productData.colors ?? [],
      stock: productData.stock ?? 0,
      featured: productData.featured ?? false,
      is_vip: productData.is_vip ?? null,
      is_new: productData.is_new ?? null,

      // valores fuente para trigger de inversión
      peso: productData.peso ?? null,
      precio_compra: productData.precio_compra ?? null,
      inversion_cup: null, // lo calcula el trigger
      colaboracion_id: productData.colaboracion_id ?? null,
      created_at: now,
      updated_at: now,
    }

    const payload: ProductsInsert[] = Array.from({ length: quantity }, () => ({
      ...base,
      id: uuidv4(),
    }))

  const { data, error } = await getSupabaseAdmin().from("products").insert(payload as never).select()
    if (error) {
      console.error("Error en la creación masiva:", error)
      return NextResponse.json({ error: "Error en la creación masiva" }, { status: 500 })
    }

    return NextResponse.json({ createdCount: data?.length ?? 0 })
  } catch (err) {
    console.error("Excepción en /api/admin/productos/bulk:", err)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
