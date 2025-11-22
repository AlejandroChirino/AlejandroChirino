"use client"

import React, { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { toast } from "@/components/ui/use-toast"

export default function ResetPasswordClient() {
  const supabase = createBrowserClient()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)

  const minLength = 8

  function validate() {
    if (!currentPassword || !newPassword || !confirmPassword) return false
    if (newPassword !== confirmPassword) return false
    if (newPassword.length < minLength) return false
    return true
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) {
      toast({ title: "Formulario inválido", description: "Revisa los campos y asegúrate que las contraseñas coincidan.", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      // Attempt to update user's password via Supabase client
      const { data, error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) {
        // If Supabase requires re-auth, surface a helpful message
        toast({ title: "No fue posible cambiar la contraseña", description: error.message || String(error), variant: "destructive" })
        setSaving(false)
        return
      }

      // Optionally sign the user out to force re-login (commented out; keep session by default)
      // await supabase.auth.signOut()

      toast({ title: "Contraseña actualizada", description: "Tu contraseña se actualizó correctamente.", variant: "default" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      console.error(err)
      toast({ title: "Error", description: err?.message ?? "No se pudo cambiar la contraseña.", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-md">
      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-400 mb-2">Contraseña actual</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
            placeholder="Ingresa tu contraseña actual"
            autoComplete="current-password"
            aria-label="Contraseña actual"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Nueva contraseña</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
            placeholder="Nueva contraseña"
            autoComplete="new-password"
            aria-label="Nueva contraseña"
          />
          <div className="mt-2 text-xs text-gray-400">Mínimo {minLength} caracteres. Usa una combinación de letras y números para mayor seguridad.</div>
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Confirmar nueva contraseña</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-transparent border-0 border-b border-gray-200 focus:border-accent-orange outline-none py-2"
            placeholder="Confirma la nueva contraseña"
            autoComplete="new-password"
            aria-label="Confirmar nueva contraseña"
          />
        </div>

        <div className="pt-6">
          <button
            type="submit"
            disabled={!validate() || saving}
            className={`w-full px-4 py-2 rounded-md text-white ${validate() && !saving ? 'bg-accent-orange hover:bg-accent-orange/90' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>
            {saving ? "Cambiando..." : "CAMBIAR CONTRASEÑA"}
          </button>
        </div>
      </div>
    </form>
  )
}
