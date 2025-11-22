import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import InformacionClient from "./InformacionClient"

export default async function InformacionPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect("/cuenta")
  }

  const { data: profileData } = await supabase.from("user_profiles").select("id, first_name, last_name, full_name, email, phone, birthdate, gender, address").eq("id", user.id).single()

  return (
    <div className="min-h-screen">
      <main className="py-6">
        <div className="max-w-3xl mx-auto px-6">
          {/* ocultar header global para mantener la estética minimalista */}
          <style>{`header, header + div { display: none !important; } body { padding-top: 0 !important; }`}</style>

          <InformacionClient
            initialName={(((profileData as any)?.first_name || (profileData as any)?.last_name) ? [ (profileData as any)?.first_name, (profileData as any)?.last_name ].filter(Boolean).join(" ") : (profileData as any)?.full_name) ?? ""}
            initialEmail={(profileData as any)?.email ?? ""}
            initialPhone={(profileData as any)?.phone ?? ""}
            initialBirthdate={(profileData as any)?.birthdate ?? ""}
            initialGender={(profileData as any)?.gender ?? ""}
            initialAddress={(profileData as any)?.address ?? ""}
          />
        </div>
      </main>
    </div>
  )
}
