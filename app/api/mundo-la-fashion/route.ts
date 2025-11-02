import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get("featured")
    const tipo_contenido = searchParams.get("tipo_contenido")

    let query = supabase.from("mundo_la_fashion").select("*").eq("activo", true)

    if (featured === "true") {
      query = query.eq("featured", true)
    }

    if (tipo_contenido && tipo_contenido !== "all") {
      query = query.eq("tipo_contenido", tipo_contenido)
    }

    query = query.order("orden", { ascending: true })

    const { data: items, error } = await query

    if (error) {
      console.error("Error fetching mundo la fashion items:", error)
      return NextResponse.json({ error: "Error al obtener contenido editorial" }, { status: 500 })
    }

    return NextResponse.json(items || [])
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
