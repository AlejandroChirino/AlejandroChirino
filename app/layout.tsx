import type React from "react"
import type { Metadata } from "next"
import "./globals.css"

// Importar los providers
import { CartProvider } from "@/contexts/cart-context"
import { FavoritesProvider } from "@/contexts/favorites-context"
import { ToastProvider } from "@/components/ui/use-toast"
import CheckoutProviderClient from "@/components/checkout/CheckoutProviderClient"
import Header from "@/components/header"
import { createServerClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
  title: "La L Fashion - Ropa y Zapatos",
  description: "Tienda de moda online - Ropa y zapatos para hombre y mujer",
    generator: 'v0.app'
}

// Modificar el RootLayout para incluir los providers
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Este layout se ejecuta en el servidor; obtenemos la sesión aquí y la
  // pasamos al Header ya resuelta para evitar lógica de promesas en cliente.
  let serverUser: any = null
  try {
    const supabase = await createServerClient()
    const { data } = await supabase.auth.getUser()
    const user = data?.user ?? null
    if (user) {
      const { data: profile } = await supabase.from('user_profiles').select('id, name, role, email').eq('id', user.id).single()
      serverUser = { ...user, profile }
    }
  } catch (e) {
    serverUser = null
  }

  return (
    <html lang="es">
      <body className="min-h-screen bg-white">
          <CartProvider>
            <FavoritesProvider>
              <ToastProvider>
                <CheckoutProviderClient>
                  {/* @ts-ignore - pass resolved server user (can be null) */}
                  <Header initialUser={serverUser} />
                  {children}
                </CheckoutProviderClient>
              </ToastProvider>
            </FavoritesProvider>
          </CartProvider>
      </body>
    </html>
  )
}
