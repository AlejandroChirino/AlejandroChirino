"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ProfileEditor() {
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState("")
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const { data: userData } = await supabase.auth.getUser()
      const user = userData?.user
      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data: p } = await supabase.from("user_profiles").select("id, name, email, created_at").eq("id", user.id).single()
      if (!mounted) return
      setProfile(p)
      setName(p?.name ?? "")
      setLoading(false)
    }
    load()
    return () => { mounted = false }
  }, [])

  const handleSave = async () => {
    if (!profile) return
    setSaving(true)
    try {
      await supabase.from("user_profiles").update({ name }).eq("id", profile.id)
      setProfile({ ...profile, name })
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div>Cargando perfil...</div>
  if (!profile) return <div>No hay perfil disponible.</div>

  return (
    <div className="bg-white p-6 rounded-lg border">
      {/* Display mode: large name + email subtitle with edit icon */}
      {!editing ? (
        <div className="flex items-start justify-between">
          <div>
              <div className="text-2xl font-semibold leading-tight">{profile.name || "Usuario"}</div>
              <div className="text-sm font-medium text-gray-700 mt-1 inline-block border-b border-gray-200 pb-0.5">{profile.email}</div>
            </div>
          <button
            aria-label="Editar perfil"
            onClick={() => setEditing(true)}
            className="p-2 text-gray-600 hover:text-gray-900"
          >
            {/* Pencil icon */}
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 0 0-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 0 0 0-2.828z" />
              <path fillRule="evenodd" d="M2 15a1 1 0 0 0 1 1h3.586l7.707-7.707-3.586-3.586L3 12.414V15z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      ) : (
        <div>
          <h3 className="text-lg font-medium mb-4">Editar perfil</h3>

          <div className="mb-4">
            <label className="block text-sm text-gray-500 mb-1">Nombre completo</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 pb-1 bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange transition-colors outline-none"
              placeholder="Tu nombre"
            />
          </div>

          <div className="mb-4 text-sm">
            <span className="text-gray-500">Email:</span>
            <span className="font-medium ml-2">{profile.email}</span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={async () => { await handleSave(); setEditing(false) }}
              disabled={saving}
              className="px-4 py-2 bg-accent-orange text-white rounded-md text-sm font-medium"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>

            <button
              onClick={() => { setName(profile?.name ?? ""); setEditing(false) }}
              className="px-4 py-2 border border-gray-200 text-gray-700 rounded-md text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
