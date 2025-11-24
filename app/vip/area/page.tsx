import type React from "react"
import { createServerClient } from "@/lib/supabase/server"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"
import ArticuloCard from "@/components/articulo-card"
import type { ArticuloEnCamino } from "@/lib/types"

export default async function VipAreaPage(): Promise<JSX.Element> {
  // Verificar sesión del usuario desde el servidor
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.auth.getUser()
    const user = data?.user ?? null

    if (!user) {
      return (
        <div className="p-6">
          <div className="max-w-6xl mx-auto text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6">Esta sección está disponible solo para miembros VIP autenticados.</p>
            <a
              href="/cuenta/iniciar"
              className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Iniciar Sesión
            </a>
          </div>
        </div>
      )
    }

    // Comprobar flag is_vip en el perfil
    const { data: profile } = await supabase.from("user_profiles").select("is_vip").eq("id", user.id).maybeSingle()
    if (!profile || !profile.is_vip) {
      return (
        <div className="p-6">
          <div className="max-w-6xl mx-auto text-center py-16">
            <h1 className="text-3xl font-bold mb-4">Acceso Restringido</h1>
            <p className="text-gray-600 mb-6">Esta área está reservada para clientes VIP. Si crees que es un error, contacta soporte.</p>
            <a
              href="/vip"
              className="inline-block bg-white border border-emerald-600 text-emerald-600 px-6 py-3 rounded-lg hover:bg-emerald-50 transition-colors"
            >
              Volver a Beneficios VIP
            </a>
          </div>
        </div>
      )
    }

    // Usuario VIP: obtener articulos en camino desde el cliente admin
    const admin = getSupabaseAdmin()
    const { data: articulos } = await admin.from("articulos_en_camino").select("*").order("estimated_arrival", { ascending: true }).limit(50)

    const list: ArticuloEnCamino[] = Array.isArray(articulos) ? articulos : []

    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-4">Área VIP — Lanzamientos y Preventa</h1>
          <p className="text-gray-600 mb-6">Aquí encontrarás los próximos lanzamientos y artículos en preventa.</p>

          {list.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No hay artículos en preventa</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {list.map((a) => (
                <ArticuloCard key={a.id} articulo={a} />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error accediendo a área VIP:", error)
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto text-center py-16">
          <h1 className="text-3xl font-bold mb-4">Error</h1>
          <p className="text-gray-600">No se pudo verificar tu acceso. Intenta iniciar sesión otra vez.</p>
          <a
            href="/cuenta/iniciar"
            className="inline-block bg-accent-orange text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors mt-4"
          >
            Iniciar Sesión
          </a>
        </div>
      </div>
    )
  }
}
