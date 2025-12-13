import { NextResponse } from "next/server"
import { getAdminDb } from "@/lib/adminClient"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: "missing email" }, { status: 400 })

    let supabase
    try {
      supabase = await getAdminDb()
    } catch (err: any) {
      return NextResponse.json({ error: 'Admin client not available' }, { status: 401 })
    }

    // Usar admin API para buscar por email
    try {
      // supabase-js v2 ofrece admin.getUserByEmail
      // Si no está disponible en tu versión, esta llamada fallará y retornará error descriptivo.
      // Alternativa: consultar directamente la tabla auth.users no es posible desde public schema.
      // Por eso usamos el cliente admin.
      // @ts-ignore
      const { data, error } = await supabase.auth.admin.getUserByEmail(email)
      if (error) {
        return NextResponse.json({ error: error.message || "db error" }, { status: 500 })
      }

      if (data) return NextResponse.json({ exists: true }, { status: 200 })
      return NextResponse.json({ exists: false }, { status: 200 })
    } catch (err: any) {
      return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 500 })
  }
}
