import { type NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function GET() {
  try {
  const resp = await supabaseAdmin.from("configuracion").select("*").single()
  const config = resp.data as { id: number; precio_libra: number; valor_dolar: number; updated_at?: string } | null
  const error = resp.error

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

    const { data: config, error } = await supabaseAdmin
      .from("configuracion")
      .update({
        precio_libra: body.precio_libra,
        valor_dolar: body.valor_dolar,
        updated_at: new Date().toISOString(),
      } as never)
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
