import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"
import type { ProductFormData } from "@/lib/admin-types"

export async function POST(request: Request) {
  const { productData, quantity }: { productData: ProductFormData; quantity: number } = await request.json()
  const supabase = createRouteHandlerClient({ cookies })

  if (!productData || !quantity || quantity <= 0) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const productsToInsert = Array.from({ length: quantity }, () => ({
    ...productData,
    id: uuidv4(),
    // Asegurarse de que los campos de imagen estén vacíos si no se proporcionan
    image_url: productData.image_url || "",
  }))

  const { data, error } = await supabase.from("products").insert(productsToInsert).select()

  if (error) {
    console.error("Error en la creación masiva:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ createdCount: data.length })
}
