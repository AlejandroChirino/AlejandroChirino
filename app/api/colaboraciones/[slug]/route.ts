import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const { data: colaboracion, error } = await supabase
      .from("colaboraciones")
      .select("*")
      .eq("slug", slug)
      .eq("activa", true)
      .single()

    if (error) {
      console.error("Error fetching colaboracion:", error)
      if (error.code === "PGRST116") {
        return NextResponse.json({ error: "Colaboración no encontrada" }, { status: 404 })
      }
      return NextResponse.json({ error: "Error al obtener colaboración" }, { status: 500 })
    }

    if (!colaboracion) {
      return NextResponse.json({ error: "Colaboración no encontrada" }, { status: 404 })
    }

    return NextResponse.json(colaboracion)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
