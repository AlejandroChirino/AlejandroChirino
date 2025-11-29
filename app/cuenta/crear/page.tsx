"use client"

import React, { useState } from "react"
import Button from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

export default function CreateAccountPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    // Primero comprobamos si el email ya existe usando la API admin
    try {
      const check = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const checkJson = await check.json()
      if (!check.ok) {
        // Si la API falla, dejamos continuar y confiar en signUp para reportar el error
        console.warn("check-email api warning:", checkJson)
      } else if (checkJson.exists) {
        setError("Este email ya está registrado. ¿Olvidaste tu contraseña?")
        return
      }
    } catch (err) {
      console.warn("check-email failed", err)
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.")
      return
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.")
      return
    }

    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Si quieres enviar datos adicionales después, hacerlo desde el servidor
        },
      })

      console.debug("[signup] data:", data, "error:", error)

      if (error) {
        setError(error.message || "Error al crear la cuenta")
        setLoading(false)
        return
      }

      // Si signUp devolvió user id, intentamos crear el perfil server-side
      const userId = data?.user?.id
      if (userId) {
        try {
          const resp = await fetch("/api/auth/create-profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: userId, email }),
          })
          const json = await resp.json()
          if (!resp.ok) {
            // Si la inserción falló por algún motivo, mostramos el error devuelto
            setError(json?.error || "Error al crear el perfil")
            setLoading(false)
            return
          }
        } catch (err: any) {
          setError(err?.message || "Error al crear el perfil")
          setLoading(false)
          return
        }
      }

      // Éxito: mostrar mensaje (no redirigimos automáticamente, conservamos la lógica previa)
      setSuccess(true)
      setEmail("")
      setPassword("")
      setConfirm("")
    } catch (err: any) {
      setError(err?.message || "Ocurrió un error al crear la cuenta")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center">
      <div className="max-w-md w-full mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <a href="/" className="inline-flex items-end gap-1 whitespace-nowrap">
            <span className="text-2xl md:text-3xl font-bold tracked-strong uppercase leading-none">LA</span>
            <span className="inline-block -mb-0.5 text-2xl md:text-3xl leading-none -ml-0.5 -mr-0.5">⚡</span>
            <span className="text-2xl md:text-3xl font-bold tracked-strong uppercase leading-none">FASHION</span>
          </a>
        </div>

        <h1 className="text-2xl font-semibold text-black mb-4">Crear cuenta</h1>
        <p className="text-gray-600 mb-8">Regístrate para guardar tus compras y acceder a funciones exclusivas</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-100 rounded">Cuenta creada. Revisa tu email.</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-black mb-2">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-[var(--brand-green)]"
              placeholder="tu@email.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-black mb-2">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-[var(--brand-green)]"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm font-semibold text-black mb-2">Confirmar contraseña</label>
            <input
              id="confirm"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-[var(--brand-green)]"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <Button type="submit" variant="primary" size="md" className="w-full py-3">
              {loading ? "Creando..." : "Crear cuenta"}
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-700">
          ¿Ya tienes cuenta? <Link href="/cuenta/iniciar" className="text-gray-700">Iniciar sesión</Link>
        </div>
      </div>
    </div>
  )
}
