"use client"

import React, { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import Button from "@/components/ui/button"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message || "Credenciales incorrectas")
        return
      }
      // After successful sign-in, try to sync the Supabase auth token into
      // an HttpOnly cookie so server-side routes using `createServerClient`
      // can see the session. We look for the localStorage key used by
      // Supabase client and post it to `/api/auth/sync` which will set the
      // cookie.
      try {
        const keys = Object.keys(localStorage)
        const tokenKey = keys.find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"))
        if (tokenKey) {
          const tokenValue = localStorage.getItem(tokenKey)
          if (tokenValue) {
            await fetch('/api/auth/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ key: tokenKey, value: tokenValue }),
            })
          }
        }
      } catch (err) {
        console.warn('Failed to sync auth cookie after sign-in', err)
      }

      router.push("/")
    } catch (err) {
      setError("Ocurrió un error al iniciar sesión")
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

        <h1 className="text-2xl font-semibold text-black mb-4">Iniciar Sesión</h1>
        <p className="text-gray-600 mb-8">Accede a tu cuenta para continuar con tus compras</p>

        {error && <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-100 rounded">{error}</div>}

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
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 p-3 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)] focus:border-[var(--brand-green)]"
                placeholder="••••••••"
                required
              />

              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-600 hover:text-gray-900"
                aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <Button type="submit" variant="primary" size="md" className="w-full py-3">
              {loading ? "Iniciando..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>

        {/* Se eliminaron los botones sociales y el separador para simplificar la UI */}

        <div className="mt-6 text-center text-sm text-gray-700">
          ¿No tienes cuenta? <Link href="/cuenta/crear" className="text-gray-700">Crear cuenta</Link>
        </div>
      </div>
    </div>
  )
}
