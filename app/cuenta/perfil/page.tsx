import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import SignOutButton from "@/components/signout-button"
import ProfileEditor from "@/components/profile-editor"

export default async function PerfilPage() {
  const supabase = await createServerClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect("/cuenta")
  }

  const { data: profileData } = await supabase.from("user_profiles").select("id, email, role").eq("id", user.id).single()

  return (
    <div className="min-h-screen">
      <main className="py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-2xl font-bold mb-6">Perfil de usuario</h1>

          <div className="bg-white p-6 rounded-lg border mb-6">
            <p className="mb-2"><strong>Email:</strong> {user.email}</p>
            <p className="mb-2"><strong>UID:</strong> {user.id}</p>
            <p className="mb-2"><strong>Rol:</strong> {profileData?.role ?? "user"}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileEditor />
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-lg font-semibold mb-4">Acciones</h3>
              <p className="mb-4">Cerrar sesión y volver al inicio.</p>
              <SignOutButton className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
