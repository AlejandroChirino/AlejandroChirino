"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function CuentaPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    // Verificar si hay una cookie de admin activa
    const cookies = typeof document !== "undefined" ? document.cookie : ""
    const hasAdminSession = cookies.split(";").some((c) => c.trim() === `admin_session=lalfashion0@gmail.com`)
    if (hasAdminSession) {
      router.replace("/admin")
    }
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Verificar si son las credenciales de admin
      if (email === "lalfashion0@gmail.com" && password === "08938774163Aa*") {
        // Establecer cookie de admin (httpOnly no es posible desde el cliente, pero es suficiente para el middleware)
        // Caduca en 1 día
        document.cookie = `admin_session=${email}; Max-Age=${60 * 60 * 24}; Path=/`
        // Redirigir al panel de administración sin recargar la página completa
        router.replace("/admin")
        return
      }

      // Para usuarios normales, usar Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError("Credenciales incorrectas")
        return
      }

      // Usuario normal logueado exitosamente. Supabase establece sb-access-token en cookies; navegar a /cuenta para que middleware/SSR lo detecte
      router.refresh()
    } catch (error) {
      setError("Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          data: {
            name: name,
          },
        },
      })

      if (error) {
        setError("Error al crear la cuenta")
        return
      }

      alert("Cuenta creada exitosamente. Revisa tu email para confirmar.")
    } catch (error) {
      setError("Error al crear la cuenta")
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Iniciar Sesión</h2>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent-orange text-white py-3 rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Iniciando..." : "Iniciar Sesión"}
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Crear Cuenta</h2>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nombre</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                    placeholder="Tu nombre"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                    placeholder="tu@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Contraseña</label>
                  <input
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-orange"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {loading ? "Creando..." : "Crear Cuenta"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
