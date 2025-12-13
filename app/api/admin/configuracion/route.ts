import { type NextRequest, NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function GET() {
  try {
    // Intentamos crear el cliente admin. Si falta la clave de servicio
    // devolvemos una configuración por defecto en lugar de 500 para
    // que la UI siga funcionando en entornos donde no tenemos la
    // `SUPABASE_SERVICE_ROLE_KEY` (ej. CI, despliegues públicos).
    let resp: any
    try {
      const supabaseAdmin = await getAdminDb()
      resp = await supabaseAdmin.from("configuracion").select("*").single()
    } catch (err) {
      console.warn("Supabase admin client not available, returning default config:", String(err))
      const defaultConfig = { id: 1, precio_libra: 0, valor_dolar: 0 }
      return NextResponse.json({ config: defaultConfig })
    }
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

    // PUT requiere el cliente admin; si no está disponible devolvemos 503
    let supabaseAdmin: any
    try {
      supabaseAdmin = await getAdminDb()
    } catch (err) {
      console.warn("Supabase admin client unavailable for PUT /api/admin/configuracion:", String(err))
      return NextResponse.json({ error: "Operación no disponible en este entorno" }, { status: 503 })
    }

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
