import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const includeProducts = searchParams.get("includeProducts")

    let query = supabase.from("colaboraciones").select("*").eq("activa", true)

    if (featured === "true") {
      query = query.eq("featured", true)
    }

    query = query.order("created_at", { ascending: false })

    const { data: colaboraciones, error } = await query

    if (error) {
      console.error("Error fetching colaboraciones:", error)
      return NextResponse.json({ error: "Error al obtener colaboraciones" }, { status: 500 })
    }

    // Si se solicita incluir productos, obtener el conteo para cada colaboración
    if (includeProducts === "true" && colaboraciones) {
      const colaboracionesWithProducts = await Promise.all(
        colaboraciones.map(async (colaboracion) => {
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("colaboracion_id", colaboracion.id)

          return {
            ...colaboracion,
            product_count: count || 0,
          }
        }),
      )

      return NextResponse.json(colaboracionesWithProducts)
    }

    return NextResponse.json(colaboraciones || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
