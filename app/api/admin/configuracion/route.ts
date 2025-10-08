import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  try {
    const { data: config, error } = await supabase.from("configuracion").select("*").single()

    if (error) {
      console.error("Error fetching config:", error)
      return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Error in GET /api/admin/configuracion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const { data: config, error } = await supabase
      .from("configuracion")
      .update({
        precio_libra: body.precio_libra,
        valor_dolar: body.valor_dolar,
        updated_at: new Date().toISOString(),
      })
      .eq("id", 1)
      .select()
      .single()

    if (error) {
      console.error("Error updating config:", error)
      return NextResponse.json({ error: "Error al actualizar configuración" }, { status: 500 })
    }

    return NextResponse.json({ config })
  } catch (error) {
    console.error("Error in PUT /api/admin/configuracion:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
