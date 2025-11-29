"use client"

import type React from "react"
import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
// Header provisto por RootLayout
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
      // Validación cliente: contraseña mínima de 6 caracteres
      if (registerPassword.length < 6) {
        setError("La contraseña debe tener al menos 6 caracteres.")
        setLoading(false)
        return
      }
      const { data, error } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
        options: {
          // El trigger en la DB se encargará de crear el perfil
        },
      })

      if (error) {
        setError(error.message || "Error al crear la cuenta. El email podría ya estar en uso.")
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
    <div className="min-h-screen bg-white">
      {/* Minimal header area inside the page to keep focus on auth */}
      <main className="min-h-[calc(100vh-96px)] flex items-center">
        <div className="max-w-md mx-auto w-full px-6 text-center">
          <div className="mb-8 md:mb-10">
            <a href="/" className="flex items-end gap-1 justify-center whitespace-nowrap">
              <span className="text-2xl md:text-3xl font-bold tracked-strong uppercase leading-none">LA</span>
              <span className="inline-block -mb-0.5 text-2xl md:text-3xl leading-none -ml-0.5 -mr-0.5">⚡</span>
              <span className="text-2xl md:text-3xl font-bold tracked-strong uppercase leading-none">FASHION</span>
            </a>
          </div>
          <h1 className="text-2xl md:text-3xl font-semibold text-black mb-3">Bienvenido a LA FASHION</h1>
          <p className="text-gray-600 mb-10">Tu estilo te espera</p>

          <div className="flex flex-col md:flex-row gap-2 md:gap-6 justify-center items-center">
            <Button as="a" href="/cuenta/crear" variant="primary" size="md" className="w-auto px-6 rounded-full">
              Crear Cuenta
            </Button>

            <Button
              as="a"
              href="/cuenta/iniciar"
              variant="outline"
              size="md"
              className="w-auto px-6 rounded-full border border-gray-300 text-black hover:bg-gray-50"
            >
              Iniciar Sesión
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
