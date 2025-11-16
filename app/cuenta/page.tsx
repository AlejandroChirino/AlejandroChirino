"use client"

import type React from "react"
import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Button from "@/components/ui/button"
import { useRouter } from "next/navigation"

export default function CuentaPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [registerSuccess, setRegisterSuccess] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Usar Supabase Auth para todos los inicios de sesión
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError("Credenciales incorrectas. Por favor, inténtalo de nuevo.")
        return
      }

      // Redirección gestionada por el middleware
      // Simplemente refrescamos la página para que el middleware actúe
      router.refresh()
      router.push('/') // Redirige al home, el middleware se encargará si es admin

    } catch (error) {
      setError("Ocurrió un error inesperado al iniciar sesión.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setRegisterSuccess(false)

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          // El trigger en la DB se encargará de crear el perfil
        },
      })

      if (error) {
        setError("Error al crear la cuenta. El email podría ya estar en uso.")
        return
      }

      setRegisterSuccess(true)
      
    } catch (error) {
      setError("Ocurrió un error inesperado al crear la cuenta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />

      <main className="py-8">
        <div className="max-w-4xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Mi Cuenta</h1>

          {error && <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">{error}</div>}
          {registerSuccess && <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">¡Cuenta creada! Revisa tu email para confirmar tu registro.</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Iniciar Sesión</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-sm font-medium mb-2">Email</label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full py-3 text-base">
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </Button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Crear Cuenta</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="register-name" className="block text-sm font-medium mb-2">Nombre</label>
                  <input
                    id="register-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="register-email" className="block text-sm font-medium mb-2">Email</label>
                  <input
                    id="register-email"
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="register-password" className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-green)]"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full py-3 text-base">
                  {loading ? "Creando..." : "Crear Cuenta"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
