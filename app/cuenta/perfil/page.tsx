import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import PerfilClient from "./PerfilClient"

export default async function PerfilPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect("/cuenta")
  }

  const { data: profileData } = await supabase.from("user_profiles").select("id, full_name, email, role").eq("id", user.id).single()

  return (
    <div className="min-h-screen">
      <main className="py-4">
        <div className="max-w-3xl mx-auto px-4">
          {/* ocultar el header global y su espaciador solo en esta página */}
          <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

          {/* Sección inicial minimalista: PerfilClient maneja la visualización de nombre/email. */}
          <div className="grid grid-cols-1 gap-6">
            <div>
              <PerfilClient name={(profileData as any)?.full_name ?? (user as any)?.email ?? "ALEJANDRO"} email={(profileData as any)?.email ?? (user as any)?.email} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

