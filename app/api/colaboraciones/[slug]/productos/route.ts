import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    // Primero obtener la colaboración para verificar que existe
    const { data: colaboracion, error: colaboracionError } = await supabase
      .from("colaboraciones")
      .select("id")
      .eq("slug", params.slug)
      .eq("activa", true)
      .single()

    if (colaboracionError || !colaboracion) {
      return NextResponse.json({ error: "Colaboración no encontrada" }, { status: 404 })
    }

    // Obtener productos de la colaboración
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*")
      .eq("colaboracion_id", colaboracion.id)
      .order("created_at", { ascending: false })

    if (productsError) {
      console.error("Error fetching collaboration products:", productsError)
      return NextResponse.json({ error: "Error al obtener productos de la colaboración" }, { status: 500 })
    }

    return NextResponse.json(products || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
