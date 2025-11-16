"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export default function ProfileEditor() {
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [name, setName] = useState("")

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
      <h3 className="text-lg font-semibold mb-4">Editar perfil</h3>
      <div className="mb-3">
        <label className="block text-sm font-medium mb-1">Nombre</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 border rounded" />
      </div>
      <div className="mb-3 text-sm text-gray-600">Email: {profile.email}</div>
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-accent-orange text-white rounded">
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>
    </div>
  )
}
