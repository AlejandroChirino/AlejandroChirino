"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import ConfirmModal from "@/components/confirm-modal"

export default function SignOutButton({ className, label }: { className?: string; label?: string }) {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const handleSignOut = async () => {
    setOpen(false)
    setLoading(true)
    try {
      await supabase.auth.signOut()
      // Redirect to home after sign out
      router.push("/")
    } catch (err) {
      console.error("Error signing out", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className ?? "p-2 hover:bg-gray-100 rounded-lg transition-colors"}
        aria-label="Cerrar sesión"
        disabled={loading}
      >
        {loading ? "Saliendo..." : (label ?? "Salir")}
      </button>

      <ConfirmModal
        open={open}
        title="Cerrar sesión"
        description="Si cierras sesión se perderá el estado de usuario en este dispositivo. ¿Deseas continuar?"
        confirmLabel="Cerrar sesión"
        cancelLabel="Cancelar"
        onConfirm={handleSignOut}
        onCancel={() => setOpen(false)}
      />
    </>
  )
}
